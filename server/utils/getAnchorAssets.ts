import { DroppedAssetInterface } from "@rtsdk/topia";
import { World } from "./index.js";
import { Credentials } from "../types.js";

export const getAnchorAssets = async (
  credentials: Credentials,
): Promise<{ anchorAssets: DroppedAssetInterface[]; anchorAssetIds: string[] } | Error> => {
  try {
    const { sceneDropId, urlSlug } = credentials;

    const world = World.create(urlSlug, { credentials });
    const anchorAssets: DroppedAssetInterface[] = await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId,
      uniqueName: "anchor",
    });

    const anchorAssetIds = anchorAssets.map(({ id }) => id).filter((id): id is string => typeof id === "string");

    if (anchorAssetIds.length === 0) throw "No anchor assets found.";

    return { anchorAssets, anchorAssetIds };
  } catch (error: any) {
    return new Error(error);
  }
};
