import { DroppedAssetInterface } from "@rtsdk/topia";
import { addHyphenAndNewline, errorHandler } from "../index.js";

export const dropScene = async ({
  droppedAsset,
  droppableSceneIds,
  message,
  world,
}: {
  droppedAsset: any;
  droppableSceneIds: string[];
  message: string;
  world: any;
}) => {
  try {
    const randomScene = Math.floor(Math.random() * droppableSceneIds.length);
    const sceneId = droppableSceneIds[randomScene];

    const scene = (await world.dropScene({
      sceneId,
      position: droppedAsset?.position,
      assetSuffix: "message",
    })) as any;

    const assetsList = (await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId: scene.data.sceneDropId,
    })) as DroppedAssetInterface[];

    const textAsset = assetsList.find((a) => a.assetId === "textAsset");

    if (!textAsset) throw "No text asset found.";

    await textAsset.updateCustomTextAsset({}, addHyphenAndNewline(message));

    return textAsset.id;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "dropScene",
      message: "Error dropping scene.",
    });
  }
};
