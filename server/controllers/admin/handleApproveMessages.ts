import { Request, Response } from "express";
import { DataObjectType } from "../../types.js";
import {
  addHyphenAndNewline,
  addNewRowToGoogleSheets,
  Asset,
  DroppedAsset,
  errorHandler,
  getAnchorAssets,
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
    const { anchorAssets, messages, usedSpaces, theme } = dataObject as DataObjectType;
    let updateAnchorAssets = anchorAssets;

    const thisMessage = messages[messageId];
    if (!thisMessage) throw "Message not found";
    const { imageUrl, message } = thisMessage;

    const lockId = `${sceneDropId}-${messageId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    let droppedAsset, droppedAssetId, emptySpaces;

    // get subset list of anchor asset ids that are not currently in the usedSpaces array
    emptySpaces = anchorAssets.filter((anchorAsset) => !usedSpaces.includes(anchorAsset));
    if (emptySpaces.length > 0) {
      droppedAssetId = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
    } else {
      // if all spaces are taken then update randomly selected already dropped asset
      droppedAssetId = anchorAssets[Math.floor(Math.random() * anchorAssets.length)];
    }

    try {
      droppedAsset = await DroppedAsset.get(droppedAssetId, urlSlug, { credentials });
    } catch (error) {
      // dropped asset not found, pull all anchor assets from scene and try again
      const { anchorAssetIds } = await getAnchorAssets(sceneDropId, world);
      updateAnchorAssets = anchorAssetIds;

      emptySpaces = anchorAssetIds.filter((anchorAsset: string) => !usedSpaces.includes(anchorAsset));
      if (emptySpaces.length > 0) {
        droppedAssetId = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
      } else {
        droppedAssetId = anchorAssets[Math.floor(Math.random() * anchorAssets.length)];
      }
      droppedAsset = await DroppedAsset.get(droppedAssetId, urlSlug, { credentials });
    }

    const promises = [];

    if (emptySpaces.length > 0) usedSpaces.push(droppedAssetId);

    if (imageUrl) {
      promises.push(droppedAsset.updateWebImageLayers(imageUrl, ""));
    } else if (message) {
      if (emptySpaces.length > 0) {
        // not all spaces have been used, pick empty space at random and drop web and text assets
        const { droppableAssets } = getThemeEnvVars(theme.id);

        const random = Math.floor(Math.random() * droppableAssets.length);
        const droppableAsset = droppableAssets[random];
        if (!droppableAsset?.layer0 && !droppableAsset.layer1) {
          throw "Droppable asset layers not found. Please check environment variables.";
        }

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
        let textPosition = { x: 0, y: 0 };
        if (droppedAsset?.position?.x) textPosition.x = Math.round(droppedAsset.position.x);
        if (droppedAsset?.position?.y) textPosition.y = Math.round(droppedAsset.position.y);
        if (droppableAsset.textOffsetX) {
          if (typeof droppableAsset.textOffsetX === "number") textPosition.x + droppableAsset.textOffsetX;
          else textPosition.x = textPosition.x + parseInt(droppableAsset.textOffsetX);
        } else {
          textPosition.x = textPosition.x - 1;
        }
        if (droppableAsset.textOffsetY) {
          if (typeof droppableAsset.textOffsetY === "number") textPosition.y + droppableAsset.textOffsetY;
          else textPosition.y = textPosition.y + parseInt(droppableAsset.textOffsetY);
        } else {
          textPosition.y = textPosition.y - 26;
        }
        await DroppedAsset.drop(textAsset, {
          position: textPosition,
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
        // all spaces are used, update text asset associated with selected anchor asset
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
          [`scenes.${sceneDropId}.anchorAssets`]: updateAnchorAssets,
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
