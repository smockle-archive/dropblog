import Octokit from "@octokit/rest";
import AWS from "aws-sdk";
const s3 = new AWS.S3();

type LambdaEvent = {
  Records: {
    s3: {
      bucket: { name: string };
      object: { key: string };
    };
  }[];
};

export const handler = async (event: LambdaEvent) => {
  // Get file details from 'event'
  const bucketName = event.Records[0].s3.bucket.name;
  const filePath = event.Records[0].s3.object.key;

  // Authenticate with GitHub
  const { GITHUB_TOKEN, GITHUB_USERNAME, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
    throw new Error("Missing environment variables.");
  }
  const octokit = new Octokit({
    auth: `token ${GITHUB_TOKEN}`
  });
  const githubIdentifiers = {
    owner: GITHUB_USERNAME,
    repo: GITHUB_REPO
  };

  try {
    // Read contents of a file stored in an S3 bucket
    console.log(`Reading file '${filePath}' from S3`);
    const fileObject = await s3
      .getObject({ Bucket: bucketName, Key: filePath })
      .promise();
    const fileContents =
      fileObject && fileObject.Body ? fileObject.Body.toString() : null;
    if (fileContents === null) {
      throw new Error("Could not read file contents.");
    }

    // Get the hash of the latest commit to a repo’s 'master' branch
    console.log("Getting the lastest commit in repository");
    const {
      data: {
        object: { sha: baseRef }
      }
    } = await octokit.git.getRef({
      ...githubIdentifiers,
      ref: "heads/master"
    });

    // Add a file to a git repository working tree.
    console.log("Adding file to working tree");
    const {
      data: { sha: workingTreeRef }
    } = await octokit.git.createTree({
      ...githubIdentifiers,
      tree: [
        {
          path: filePath,
          mode: "100644",
          type: "blob",
          content: fileContents
        }
      ],
      base_tree: baseRef
    });

    // Commit a git working tree
    console.log("Committing working tree");
    const {
      data: { sha: commitRef }
    } = await octokit.git.createCommit({
      ...githubIdentifiers,
      message: `Updated ${filePath}`,
      tree: workingTreeRef,
      parents: [baseRef]
    });

    // Push commit ref to git repository
    console.log("Pushing commit to repository");
    return await octokit.git.updateRef({
      ...githubIdentifiers,
      ref: "heads/master",
      sha: commitRef,
      force: true
    });
  } catch (error) {
    throw error;
  }
};
