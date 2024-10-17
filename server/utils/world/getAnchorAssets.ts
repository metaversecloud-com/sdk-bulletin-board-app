import { DroppedAssetInterface } from "@rtsdk/topia";
import { errorHandler } from "../index.js";

export const getAnchorAssets = async (sceneDropId: string, world: any) => {
  try {
    const anchorAssets: DroppedAssetInterface[] = await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId,
      uniqueName: "anchor",
    });
    const anchorAssetIds = anchorAssets.map(({ id }) => id);
    if (!anchorAssetIds) throw "No anchor assets found.";
    return { anchorAssets, anchorAssetIds };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getAnchorAssets",
      message: "Error getting anchor assets.",
    });
  }
};
