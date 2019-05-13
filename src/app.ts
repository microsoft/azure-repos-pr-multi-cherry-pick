import * as SDK from "azure-devops-extension-sdk";
import {
  CommonServiceIds,
  getClient,
  IHostPageLayoutService,
  PanelSize
} from "azure-devops-extension-api";
import { GitRestClient } from "azure-devops-extension-api/Git";
import { IPullRequest } from "./interfaces";

SDK.register(`pr-context-menu`, () => {
  return {
    execute: async (context: IPullRequest) => {
      await SDK.ready();

      const extensionContext = SDK.getExtensionContext();
      const client: GitRestClient = getClient(GitRestClient);
      const pr = await client.getPullRequestById(
        context.pullRequest.pullRequestId
      );

      const dialog = await SDK.getService<IHostPageLayoutService>(
        CommonServiceIds.HostPageLayoutService
      );

      dialog.openPanel(
        `${extensionContext.publisherId}.${
          extensionContext.extensionId
        }.cherryPicksDialog`,
        {
          title: `Cherry-pick pull request ${pr.pullRequestId}`,
          size: PanelSize.Large,
          configuration: {
            pullRequest: pr
          }
        }
      );
    }
  };
});

SDK.init();
