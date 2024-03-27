import { DroppedAssetInterface } from "@rtsdk/topia";
import { MessageType } from "../types";
import { addHyphenAndNewline, errorHandler } from "../utils";

export const dropScene = async ({ droppedAsset, droppableSceneIds, message, world }: { droppedAsset: any, droppableSceneIds: string[], message: MessageType, world: any }) => {
  try {
    const randomScene = Math.floor(Math.random() * droppableSceneIds.length);
    const sceneId = droppableSceneIds[randomScene]

    const scene = (await world.dropScene({
      sceneId,
      position: droppedAsset?.position,
      assetSuffix: "message",
    })) as any;

    const assetsList = (await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId: scene.data.sceneDropId,
    })) as DroppedAssetInterface[];

    const textAsset = assetsList.find((a) => a.assetId === "textAsset");

    await textAsset.updateCustomTextAsset(
      {},
      addHyphenAndNewline(message.message)
    );

    return textAsset.id;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "dropScene",
      message: "Error dropping scene.",
    });
  }
};