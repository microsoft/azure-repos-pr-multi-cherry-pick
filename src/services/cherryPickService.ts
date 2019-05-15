import { getClient } from "azure-devops-extension-api";

import {
  GitRestClient,
  GitPullRequest,
  GitCherryPick,
  GitAsyncRefOperationParameters,
  GitPullRequestMergeStrategy,
  GitAsyncOperationStatus,
  GitRepository,
  GitPullRequestSearchCriteria,
  PullRequestStatus
} from "azure-devops-extension-api/Git";

import { Constants, trimStart } from "../utilities";
import { IRestClientResult } from "../interfaces";

const client: GitRestClient = getClient(GitRestClient);

export async function CherryPickCommitsAsync(
  pullRequest: GitPullRequest,
  targetTopicBranchName: string,
  targetBranchName: string
): Promise<IRestClientResult<GitCherryPick>> {
  try {
    if (!targetTopicBranchName.startsWith("refs/heads")) {
      targetTopicBranchName = `refs/heads/${targetTopicBranchName}`;
    }

    if (!targetBranchName.startsWith("refs/heads")) {
      targetBranchName = `refs/heads/${targetBranchName}`;
    }

    const cherryPickSource: any = {
      pullRequestId: pullRequest.pullRequestId
    };

    const cherryPickRequestParams: GitAsyncRefOperationParameters = {
      generatedRefName: targetTopicBranchName,
      ontoRefName: targetBranchName,
      repository: pullRequest.repository,
      source: cherryPickSource
    };

    let cherryPick: GitCherryPick = await client.createCherryPick(
      cherryPickRequestParams,
      pullRequest.repository.project.id,
      pullRequest.repository.id
    );

    // Check for new status every second
    const intervalMs = 1000;
    const timeoutMs = Constants.RequestTimeoutSeconds * 1000;
    let retries = 0;
    let inProgress =
      cherryPick.status === GitAsyncOperationStatus.Queued ||
      cherryPick.status === GitAsyncOperationStatus.InProgress;

    while (inProgress && intervalMs * retries < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));

      cherryPick = await client.getCherryPick(
        pullRequest.repository.project.id,
        cherryPick.cherryPickId,
        pullRequest.repository.id
      );

      inProgress =
        cherryPick.status === GitAsyncOperationStatus.Queued ||
        cherryPick.status === GitAsyncOperationStatus.InProgress;

      retries++;
    }

    // If not complete, complain
    if (inProgress) {
      return { error: `Unable to cherry-pick to ${targetTopicBranchName}` };
    }

    if (cherryPick.status !== GitAsyncOperationStatus.Completed) {
      if (
        cherryPick.detailedStatus.conflict &&
        cherryPick.detailedStatus.currentCommitId
      ) {
        return {
          error: `There were conflicts when cherry-picking commit ${
            cherryPick.detailedStatus.currentCommitId
          }. This operation needs to be done locally.`
        };
      }
      return { error: cherryPick.detailedStatus.failureMessage };
    }

    return { result: cherryPick };
  } catch (ex) {
    return { error: ex };
  }
}

export async function CreatePullRequestAsync(
  cherryPick: GitCherryPick,
  pullRequest: GitPullRequest,
  topicBranchName: string,
  targetBranchName: string,
  repository: GitRepository
): Promise<IRestClientResult<GitPullRequest>> {
  try {
    if (cherryPick.status !== GitAsyncOperationStatus.Completed) {
      throw new Error("Cherry-pick operation is not completed");
    }

    let sourceRefName = topicBranchName;
    if (!sourceRefName.startsWith("refs/heads")) {
      sourceRefName = `refs/heads/${sourceRefName}`;
    }

    let targetRefName = targetBranchName;
    if (!targetRefName.startsWith("refs/heads")) {
      targetRefName = `refs/heads/${targetRefName}`;
    }

    //Check that target topic branch doesnt have any open PR's
    const targetRefrence: GitPullRequestSearchCriteria = {
      targetRefName: targetRefName,
      creatorId: "",
      includeLinks: false,
      repositoryId: repository.id,
      reviewerId: "",
      sourceRefName: sourceRefName,
      sourceRepositoryId: "",
      status: PullRequestStatus.Active
    };

    const pullRequests = await client.getPullRequestsByProject(
      repository.project.id,
      targetRefrence
    );

    if (pullRequests !== undefined && pullRequests.length > 0) {
      if (pullRequests.length == 1) {
        return {
          result: pullRequests.pop()
        };
      } else {
        return {
          error:
            "Internal azure devops error: multiple PR's exist between target and topic branches"
        };
      }
    }

    const completionOptions: any = {
      deleteSourceBranch: true,
      mergeStrategy: GitPullRequestMergeStrategy.Squash,
      squashMerge: true
    };

    const pullRequestToCreate: any = {
      sourceRefName: `refs/heads/${topicBranchName}`,
      targetRefName: `refs/heads/${targetBranchName}`,
      completionOptions: completionOptions,
      title: `Multi-Cherry-Picks: Merge ${topicBranchName} to ${targetBranchName}`,
      description: pullRequest.description
    };

    const pr: GitPullRequest = await client.createPullRequest(
      pullRequestToCreate,
      pullRequest.repository.id,
      pullRequest.repository.project.id
    );

    return { result: pr };
  } catch (ex) {
    return { error: ex };
  }
}

export async function ValidateTargetBranchesAsync(
  repository: GitRepository,
  targetTopicBranchName: string,
  targetBranchName: string
): Promise<IRestClientResult<boolean>> {
  let targetBranch = targetBranchName;
  // Check to ensure targetBranch exists in repo
  if (!targetBranch.startsWith("heads/")) {
    targetBranch = `heads/${targetBranch}`;
  }
  const targetRef = await client.getRefs(
    repository.id,
    repository.project.id,
    targetBranch
  );

  if (!targetRef.find(x => x.name === `refs/${targetBranch}`)) {
    return {
      error: "Target branch does not exist",
      result: false
    };
  }

  let topicBranch = targetTopicBranchName;
  // Check to ensure targetTopicBranch does not exists in repo
  if (!topicBranch.startsWith("heads/")) {
    topicBranch = `heads/${topicBranch}`;
  }

  const targetTopicRefs = await client.getRefs(
    repository.id,
    repository.project.id,
    topicBranch
  );

  if (targetTopicRefs.find(x => x.name === `refs/${topicBranch}`)) {
    return {
      error: `Target topic branch already exists`,
      result: false
    };
  }

  return {
    result: true
  };
}
