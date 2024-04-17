import { Request, Response } from "express";
import { DataObjectType } from "../types.js";
import {
  DroppedAsset,
  dropScene,
  errorHandler,
  getCredentials,
  getPendingMessages,
  getThemeEnvVars,
  getWorldDataObject,
} from "../utils/index.js";

export const handleApproveMessages = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const credentials = getCredentials(req.query);
    const { sceneDropId, urlSlug } = credentials;

    const { dataObject, world } = await getWorldDataObject(credentials);
    const { anchorAssets, messages, usedSpaces, placedAssets, theme } = dataObject as DataObjectType;

    const thisMessage = messages[messageId];
    if (!thisMessage) throw new Error("Message not found");
    const { imageUrl, message } = thisMessage;

    const lockId = `${sceneDropId}-${messageId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    const emptySpaces = anchorAssets.filter((anchorAsset) => !usedSpaces.includes(anchorAsset));

    let droppedAssetId;
    // if all spaces are taken then update randomly selected already dropped asset
    if (emptySpaces.length > 0) {
      droppedAssetId = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
    } else {
      droppedAssetId = placedAssets[Math.floor(Math.random() * placedAssets.length)];
    }
    const droppedAsset = await DroppedAsset.get(droppedAssetId, urlSlug, { credentials });

    const promises = [];

    if (emptySpaces.length > 0) usedSpaces.push(droppedAssetId);

    if (imageUrl) {
      promises.push(droppedAsset.updateWebImageLayers(imageUrl, ""));
    } else if (message) {
      if (emptySpaces.length > 0) {
        const { droppableSceneIds } = getThemeEnvVars(theme.id);
        const droppedAssetId = await dropScene({ droppedAsset, droppableSceneIds, message, world });
        placedAssets.push(droppedAssetId);
      } else {
        const textAsset = DroppedAsset.create(droppedAssetId, urlSlug);
        await textAsset.updateCustomTextAsset({}, message);
      }
    }

    promises.push(
      world.updateDataObject(
        {
          [`scenes.${sceneDropId}.messages.${messageId}.approved`]: true,
          [`scenes.${sceneDropId}.placedAssets`]: placedAssets,
          [`scenes.${sceneDropId}.usedSpaces`]: usedSpaces,
        },
        { lock: { lockId, releaseLock: true } },
      ),
    );

    await Promise.all(promises);

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
