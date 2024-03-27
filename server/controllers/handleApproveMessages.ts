import { Request, Response } from "express";
import { DataObjectType } from '../types';
import {
  DroppedAsset,
  dropScene,
  errorHandler,
  getCredentials,
  getPendingMessages,
  getThemeEnvVars,
  getWorldDataObject,
  updateWebImage,
  World,
} from "../utils";

export const handleApproveMessages = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const credentials = getCredentials(req.query);
    const { sceneDropId, urlSlug } = credentials

    const { dataObject, world } = await getWorldDataObject(credentials);
    const {
      anchorAssets,
      messages,
      usedSpaces,
      placedAssets,
      theme,
    } = dataObject as DataObjectType;

    const message = messages[messageId];
    if (!message) throw new Error("Message not found");
    const lockId = `${sceneDropId}-${messageId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    const emptySpaces = anchorAssets.filter((anchorAsset) => !usedSpaces.includes(anchorAsset));

    if (emptySpaces.length > 0) {
      const random = Math.floor(Math.random() * emptySpaces.length);
      const emptySpaceId = emptySpaces[random];
      const droppedAsset = await DroppedAsset.get(emptySpaceId, urlSlug, { credentials })
      usedSpaces.push[emptySpaceId];

      let droppedAssetId
      if (message.imageUrl) {
        droppedAssetId = await updateWebImage({ droppedAsset, message, urlSlug })
      } else {
        const world = await World.create(urlSlug, { credentials });
        const { droppableSceneIds } = getThemeEnvVars(theme.id)
        droppedAssetId = await dropScene({ droppedAsset, droppableSceneIds, message, world })
      }
      placedAssets.push(droppedAssetId)

      await world.updateDataObject({
        [`scenes.${sceneDropId}.messages.${messageId}.approved`]: true,
        placedAssets,
        usedSpaces,
      }, { lock: { lockId, releaseLock: true } });
    } else {
      // if all spaces are taken then update randomly selected already dropped asset
      const random = Math.floor(Math.random() * placedAssets.length);
      const assetId = placedAssets[random];

      if (message.imageUrl) {
        await updateWebImage({ droppedAssetId: assetId, message, urlSlug })
      } else {
        const textAsset = DroppedAsset.create(assetId, urlSlug);
        await textAsset.updateCustomTextAsset({}, message.message);
      }

      await world.updateDataObject({ [`scenes.${sceneDropId}.messages.${messageId}.approved`]: true }, { lock: { lockId, releaseLock: true } });
    }

    return res.json(await getPendingMessages({ sceneDropId, world }));
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