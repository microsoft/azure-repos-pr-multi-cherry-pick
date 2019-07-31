import { GitPullRequest, GitCherryPick } from "azure-devops-extension-api/Git";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";

export interface IPullRequest {
  pullRequest: GitPullRequest;
}

export interface ICherryPickTarget {
  targetBranch: string;
  topicBranch: string;
  pullRequestName: string;
  id: string;
  createPr: boolean;
  error: boolean;
  errorMessage: string;
  selection: DropdownSelection;
}

export interface IRestClientResult<T> {
  result?: T;
  error?: string;
}

export interface IResult {
  error?: string;
  errorExists?: boolean;
  cherryPick?: GitCherryPick;
  pullRequest?: GitPullRequest;
  cherryPickUrl?: string;
  pullRequestUrl?: string;
}
