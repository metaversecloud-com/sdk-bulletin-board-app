import { Request, Response } from "express";
import { DataObjectType } from "../../types.js";
import {
  addHyphenAndNewline,
  addNewRowToGoogleSheets,
  Asset,
  DroppedAsset,
  errorHandler,
  getCredentials,
  getPendingMessages,
  getThemeEnvVars,
  getWorldDataObject,
} from "../../utils/index.js";

export const handleApproveMessages = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const credentials = getCredentials(req.query);
    const { displayName, identityId, interactivePublicKey, sceneDropId, urlSlug } = credentials;

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
        const { droppableAssets } = getThemeEnvVars(theme.id);

        const random = Math.floor(Math.random() * droppableAssets.length);
        const droppableAsset = droppableAssets[random];

        const webImageAsset = await Asset.create(process.env.IMG_ASSET_ID || "webImageAsset", {
          credentials: { interactivePublicKey, urlSlug },
        });
        await DroppedAsset.drop(webImageAsset, {
          position: {
            x: (droppedAsset?.position?.x || 0) + (parseInt(droppableAsset.imageOffsetX) || 0),
            y: (droppedAsset?.position?.y || 0) + (parseInt(droppableAsset.imageOffsetY) || 0),
          },
          isInteractive: true,
          interactivePublicKey,
          layer0: droppableAsset.layer0,
          layer1: droppableAsset.layer1,
          sceneDropId,
          uniqueName: `${sceneDropId}-background-${droppedAssetId}`,
          urlSlug,
        });

        const textAsset = await Asset.create(process.env.TEXT_ASSET_ID || "textAsset", {
          credentials: { interactivePublicKey, urlSlug },
        });
        await DroppedAsset.drop(textAsset, {
          position: {
            x: (droppedAsset?.position?.x || 0) + (parseInt(droppableAsset.textOffsetX) || -1),
            y: (droppedAsset?.position?.y || 0) + (parseInt(droppableAsset.textOffsetY) || -26),
          },
          isInteractive: true,
          isTextTopLayer: !droppableAsset.isTextTopLayer || droppableAsset.isTextTopLayer === "true" ? true : false,
          interactivePublicKey,
          sceneDropId,
          text: addHyphenAndNewline(message),
          textColor: droppableAsset.textColor || "white",
          textSize: 16,
          textWeight: "normal",
          textWidth: 190,
          uniqueName: `${sceneDropId}-text-${droppedAssetId}`,
          urlSlug,
          yOrderAdjust: parseInt(droppableAsset.yOrderAdjust) || 1000,
        });
      } else {
        const textAsset = await DroppedAsset.getWithUniqueName(
          `${sceneDropId}-text-${droppedAssetId}`,
          urlSlug,
          process.env.INTERACTIVE_SECRET!,
          credentials,
        );
        await textAsset.updateCustomTextAsset({}, addHyphenAndNewline(message));
      }
    }

    promises.push(
      world.updateDataObject(
        {
          [`scenes.${sceneDropId}.messages.${messageId}.approved`]: true,
          [`scenes.${sceneDropId}.placedAssets`]: placedAssets,
          [`scenes.${sceneDropId}.usedSpaces`]: usedSpaces,
        },
        {
          analytics: [{ analyticName: `messageApprovals` }, { analyticName: `${theme.id}-messageApprovals` }],
          lock: { lockId, releaseLock: true },
        },
      ),
    );

    promises.push(world.triggerParticle({ position: droppedAsset.position, name: "purpleSmoke_puff" }));

    addNewRowToGoogleSheets([
      {
        identityId,
        displayName,
        event: `${theme.id}-messageApprovals`,
        urlSlug,
      },
    ]);

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
