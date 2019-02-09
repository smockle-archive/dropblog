declare module "@octokit/rest" {
  namespace Octokit {
    export type Options = import("../node_modules/@octokit/rest").Options;
    export type Endpoint = import("../node_modules/@octokit/rest").Endpoint;
    export type Response<T> = import("../node_modules/@octokit/rest").Response<
      T
    >;
    export type ReposGetContentsParams = import("../node_modules/@octokit/rest").ReposGetContentsParams;
    export type ReposGetContentsResponse = {
      sha: string;
    };
    export type ReposDeleteFileParams = import("../node_modules/@octokit/rest").ReposDeleteFileParams;
    export type ReposDeleteFileResponse = import("../node_modules/@octokit/rest").ReposDeleteFileResponse;
    export type GitUpdateRefParams = import("../node_modules/@octokit/rest").GitUpdateRefParams;
    export type GitUpdateRefResponse = import("../node_modules/@octokit/rest").GitUpdateRefResponse;
  }
  class Octokit {
    constructor(options?: Octokit.Options);
    repos: {
      /**
       * Gets the contents of a file or directory in a repository. Specify the file path or directory in `:path`. If you omit `:path`, you will receive the contents of all files in the repository.
       */
      getContents: {
        (params?: Octokit.ReposGetContentsParams): Promise<
          Octokit.Response<Octokit.ReposGetContentsResponse>
        >;
        endpoint: Octokit.Endpoint;
      };
      /**
       * Deletes a file in a repository.
       */
      deleteFile: {
        (params?: Octokit.ReposDeleteFileParams): Promise<
          Octokit.Response<Octokit.ReposDeleteFileResponse>
        >;
        endpoint: Octokit.Endpoint;
      };
    };
    git: {
      updateRef: {
        (params?: Octokit.GitUpdateRefParams): Promise<
          Octokit.Response<Octokit.GitUpdateRefResponse>
        >;
        endpoint: Octokit.Endpoint;
      };
    };
  }
  export = Octokit;
}
