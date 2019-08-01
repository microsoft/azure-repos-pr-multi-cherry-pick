import * as SDK from "azure-devops-extension-sdk";
import { GitPullRequest, GitCherryPick } from "azure-devops-extension-api/Git";
import { ICherryPickTarget } from "./interfaces";

export class Guid {
  static newGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export module Constants {
  // One minute timeout
  export const RequestTimeoutSeconds = 60;
}

export function trimStart(target: string, trim: string): string {
  if (target.startsWith(trim)) {
    return target.slice(trim.length);
  }
  return target;
}

export function spacesValidation(text: string): boolean {
  //  let trimmed = text.trim();

  return !text.split("").includes(" ");
}

export function formatPrUrl(item: GitPullRequest): string {
  const host = SDK.getHost();

  const baseUrl = item.url.split("/_apis")[0];
  const link = `${baseUrl}/_git/${item.repository.name}/pullrequest/${
    item.pullRequestId
  }`;

  return link;
}

export function formatCherryPickUrl(item: GitCherryPick): string {
  const host = SDK.getHost();

  let refName = trimStart(item.parameters.generatedRefName, "refs/heads/");
  refName = encodeURIComponent(refName);

  const baseUrl = item.url.split("/_apis")[0];
  const link = `${baseUrl}/_git/${
    item.parameters.repository.name
  }?version=GB${refName}`;

  return link;
}

export function findIndex(id: string, array: ICherryPickTarget[]) {
  for (var i = 0; i < array.length; i++) {
    var currentValue = array[i];
    if (currentValue.id == id) {
      return i;
    }
  }
  return -1;
}

export function checkValuesPopulated(array: ICherryPickTarget[]) {
  let emptyValues = false;

  for (var i = 0; i < array.length; i++) {
    var currentValue = array[i];
    if (!currentValue.targetBranch || !currentValue.topicBranch) {
      emptyValues = true;
    }
  }
  return emptyValues;
}
