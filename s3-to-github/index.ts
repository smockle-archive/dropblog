import AWS from "aws-sdk";
import GitHub from "@octokit/rest";

const s3 = new AWS.S3();
const octokit = new GitHub();

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
  octokit.authenticate({
    type: "token",
    token: GITHUB_TOKEN
  });
  const githubIdentifiers = {
    owner: GITHUB_USERNAME,
    repo: GITHUB_REPO
  };

  try {
    let _;

    // Read contents of a file stored in an S3 bucket
    console.log(`Reading file '${filePath}' from S3`);
    _ = await s3.getObject({ Bucket: bucketName, Key: filePath }).promise();
    const fileContents = _ && _.Body ? _.Body.toString() : null;
    if (fileContents === null) {
      throw new Error("Could not read file contents.");
    }

    // Get the hash of the latest commit to a repo’s 'master' branch
    console.log("Getting the lastest commit in repository");
    _ = (await octokit.gitdata.getReference({
      ...githubIdentifiers,
      ref: "heads/master"
    })) as { data: { object: { sha: string } } };
    const baseRef = _.data.object.sha;

    // Add a file to a git repository working tree.
    console.log("Adding file to working tree");
    _ = (await octokit.gitdata.createTree({
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
    })) as { data: { sha: string } };
    const workingTreeRef = _.data.sha;

    // Commit a git working tree
    console.log("Committing working tree");
    _ = (await octokit.gitdata.createCommit({
      ...githubIdentifiers,
      message: `Updated ${filePath}`,
      tree: workingTreeRef,
      parents: [baseRef]
    })) as { data: { sha: string } };
    const commitRef = _.data.sha;

    // Push commit ref to git repository
    console.log("Pushing commit to repository");
    return await octokit.gitdata.updateReference({
      ...githubIdentifiers,
      ref: "heads/master",
      sha: commitRef,
      force: true
    });
  } catch (error) {
    throw error;
  }
};
