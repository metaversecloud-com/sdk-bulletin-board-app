import { DroppedAssetInterface } from "@rtsdk/topia";
import { Request, Response } from "express";
import {
  addHyphenAndNewline,
  DroppedAsset,
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
  getPendingMessages,
  getThemeEnvVars,
  World,
} from "../utils";

export const handleApproveMessages = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials

    const droppedAsset = await getDroppedAssetDataObject(assetId, credentials);

    const {
      messages,
      usedSpaces,
      placedTextAssets,
      theme,
    } = droppedAsset.dataObject;

    const thisMessage = messages[messageId];
    if (!thisMessage) throw new Error("Message not found");

    const world = await World.create(urlSlug, { credentials });

    const { anchors, droppableSceneIds } = getThemeEnvVars(theme.id)
    const anchorAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: anchors,
    });

    const emptySpaces = anchorAssets.filter((anchorAsset) => !usedSpaces.includes(anchorAsset.id));

    if (emptySpaces.length > 0) {
      const random = Math.floor(Math.random() * emptySpaces.length);
      const asset = emptySpaces[random] as any;
      usedSpaces.push[asset.id];

      if (!droppableSceneIds.length) throw new Error("No scenes found");
      const randomScene = Math.floor(Math.random() * droppableSceneIds.length);

      const sc = (await world.dropScene({
        sceneId: droppableSceneIds[randomScene],
        position: asset?.position,
        assetSuffix: "message",
      })) as any;

      const assetsList = (await world.fetchDroppedAssetsBySceneDropId({
        sceneDropId: sc.data.sceneDropId,
      })) as DroppedAssetInterface[];

      const textAsset = assetsList.find((a) => a.assetId === "textAsset");
      placedTextAssets.push(textAsset)

      await textAsset.updateCustomTextAsset(
        {},
        addHyphenAndNewline(thisMessage.message)
      );

      const lockId = `${assetId}-${messageId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
      await droppedAsset.updateDataObject({
        [`messages.${messageId}.approved`]: true,
        placedTextAssets,
        usedSpaces,
      }, { lock: { lockId, releaseLock: true } });
    } else {
      // if all spaces are taken then update text for randomly selected already dropped text asset
      const random = Math.floor(Math.random() * placedTextAssets.length);
      const assetId = placedTextAssets[random];

      const textAsset = DroppedAsset.create(assetId, urlSlug);
      await textAsset.updateCustomTextAsset({}, thisMessage.message);

      const lockId = `${assetId}-${messageId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
      await droppedAsset.updateDataObject({ [`messages.${messageId}.approved`]: true }, { lock: { lockId, releaseLock: true } });
    }

    return res.send(await getPendingMessages(droppedAsset.dataObject.messages));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleApproveMessages",
      message: "Error approving messages.",
      req,
      res,
    });
  }
};