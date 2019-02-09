declare module "@octokit/rest" {
  namespace Octokit {
    export type Options = import("../node_modules/@octokit/rest").Options;
    export type Endpoint = import("../node_modules/@octokit/rest").Endpoint;
    export type Response<T> = import("../node_modules/@octokit/rest").Response<
      T
    >;
    export type GitGetRefParams = import("../node_modules/@octokit/rest").GitGetRefParams;
    export type GitGetRefResponse = {
      object: {
        sha: string;
      };
    };
    export type GitCreateTreeParams = import("../node_modules/@octokit/rest").GitCreateTreeParams;
    export type GitCreateTreeResponse = import("../node_modules/@octokit/rest").GitCreateTreeResponse;
    export type GitCreateCommitParams = import("../node_modules/@octokit/rest").GitCreateCommitParams;
    export type GitCreateCommitResponse = import("../node_modules/@octokit/rest").GitCreateCommitResponse;
    export type GitUpdateRefParams = import("../node_modules/@octokit/rest").GitUpdateRefParams;
    export type GitUpdateRefResponse = import("../node_modules/@octokit/rest").GitUpdateRefResponse;
  }
  class Octokit {
    constructor(options?: Octokit.Options);
    git: {
      getRef: {
        (params?: Octokit.GitGetRefParams): Promise<
          Octokit.Response<Octokit.GitGetRefResponse>
        >;
        endpoint: Octokit.Endpoint;
      };
      createTree: {
        (params?: Octokit.GitCreateTreeParams): Promise<
          Octokit.Response<Octokit.GitCreateTreeResponse>
        >;
        endpoint: Octokit.Endpoint;
      };
      createCommit: {
        (params?: Octokit.GitCreateCommitParams): Promise<
          Octokit.Response<Octokit.GitCreateCommitResponse>
        >;
        endpoint: Octokit.Endpoint;
      };
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
