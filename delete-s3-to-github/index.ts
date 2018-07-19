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

    // Get the hash of the latest commit to a repo’s 'master' branch
    console.log("Getting the lastest commit in repository");
    _ = (await octokit.gitdata.getReference({
      ...githubIdentifiers,
      ref: "heads/master"
    })) as { data: { object: { sha: string } } };
    const baseRef = _.data.object.sha;

    // Get a hash of the file to delete.
    console.log(`Getting a hash of file ${filePath}`);
    _ = (await octokit.repos.getContent({
      ...githubIdentifiers,
      path: filePath
    })) as { data: { sha: string } };
    const fileSha = _.data.sha;

    // Remove a file from a git repository working tree and commit.
    console.log("Removing file from working tree and committing");
    _ = (await octokit.repos.deleteFile({
      ...githubIdentifiers,
      path: filePath,
      message: `Deleted ${filePath}`,
      sha: fileSha
    })) as { data: { commit: { sha: string } } };
    const commitRef = _.data.commit.sha;

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
