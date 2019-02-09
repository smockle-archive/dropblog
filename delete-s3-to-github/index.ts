import Octokit from "@octokit/rest";

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
    // Get a hash of the file to delete.
    console.log(`Getting a hash of file ${filePath}`);
    const {
      data: { sha: fileSha }
    } = await octokit.repos.getContents({
      ...githubIdentifiers,
      path: filePath
    });

    // Remove a file from a git repository working tree and commit.
    console.log("Removing file from working tree and committing");
    const {
      data: {
        commit: { sha: commitRef }
      }
    } = await octokit.repos.deleteFile({
      ...githubIdentifiers,
      path: filePath,
      message: `Deleted ${filePath}`,
      sha: fileSha
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
