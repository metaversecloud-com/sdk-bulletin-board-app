import { MessageType } from "../types";
import { errorHandler } from "../utils";
import { DroppedAsset } from "./topiaInit";

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