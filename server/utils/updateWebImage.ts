import { MessageType } from "../types.js";
import { errorHandler } from "../utils/index.js";
import { DroppedAsset } from "./topiaInit.js";

export const updateWebImage = async ({ droppedAsset, droppedAssetId, message, urlSlug }: { droppedAsset?: any, droppedAssetId?: string, message: MessageType, urlSlug: string }) => {
  try {
    if (!droppedAsset) droppedAsset = await DroppedAsset.create(droppedAssetId, urlSlug)
    droppedAsset.updateWebImageLayers(message.imageUrl, "")

    return droppedAsset.id;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "updateWebImage",
      message: "Error updating web image asset.",
    });
  }
};