import * as SDK from "azure-devops-extension-sdk";
import { getClient } from "azure-devops-extension-api";
import {
  GitRestClient,
  GitRepository,
  RefFavoriteType,
  GitRef,
  GitRefFavorite
} from "azure-devops-extension-api/Git";
import { Constants, trimStart } from "../utilities";

const client: GitRestClient = getClient(GitRestClient);

export async function GetAllBranchesAsync(
  repository: GitRepository
): Promise<Map<string, string[]>> {
  // If defaultBranch is null, this is likely an incomplete object from the extension context
  if (repository.defaultBranch === undefined) {
    repository = await client.getRepository(
      repository.id,
      repository.project.id
    );
  }

  const results = new Map<string, string[]>();
  const defaultBranch = repository.defaultBranch;

  const [all, favorited]: [string[], GitRefFavorite[]] = await Promise.all([
    // Get all branch names that arent the default branch
    client
      .getRefs(repository.id, repository.project.id, "heads/", false, false)
      .then(a => a.map(x => x.name).filter(x => x !== defaultBranch)),

    // Get all favorited branches and folders
    client.getRefFavorites(
      repository.project.id,
      repository.id,
      SDK.getUser().id
    )
  ]);

  // Filter to favorited folders
  const favoritedFolders = favorited
    .filter(x => x.type === RefFavoriteType.Folder)
    .map(x => x.name);

  // Filter to favorited branches
  const favoritedRefs = favorited
    .filter(x => x.type === RefFavoriteType.Ref && x.name !== defaultBranch)
    .map(x => x.name);

  // Append all branches that are in a favorited folder
  favoritedRefs.push(
    ...all.filter(x => favoritedFolders.some(f => x.startsWith(f))).map(x => x)
  );

  // Filter out branches that are in a favorited folder
  const allRemainder = all.filter(
    x => !favoritedFolders.some(f => x.startsWith(f))
  );

  if (defaultBranch) {
    results.set("Default", [defaultBranch]);
  }

  if (favoritedRefs.length > 0) {
    results.set("Favorites", favoritedRefs.sort());
  }

  if (allRemainder.length > 0) {
    results.set("All", allRemainder.sort());
  }

  return results;
}
