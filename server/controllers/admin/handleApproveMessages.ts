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
  getKeyAssetDataObject,
  World,
} from "../../utils/index.js";

export const handleApproveMessages = async (req: Request, res: Response) => {
  let errorMessage = "Error approving messages.";
  try {
    const { messageId } = req.params;
    const credentials = getCredentials(req.query);
    const { assetId, displayName, identityId, interactivePublicKey, sceneDropId, urlSlug } = credentials;

    const getKeyAssetResult = await getKeyAssetDataObject(credentials);
    if (getKeyAssetResult instanceof Error) throw getKeyAssetResult;

    const { dataObject, keyAsset } = getKeyAssetResult;
    const { anchorAssets, messages, usedSpaces, theme } = dataObject as DataObjectType;
    let updateAnchorAssets = anchorAssets;

    const thisMessage = messages[messageId];
    if (!thisMessage) {
      errorMessage += " Message not found.";
      throw "Message not found";
    }
    const { imageUrl, message } = thisMessage;

    const lockId = `${assetId}-${messageId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    try {
      await keyAsset.updateDataObject({}, { lock: { lockId } });
    } catch (error) {
      return res.status(409).json({ message: "Message is currently being approved by another admin." });
    }

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
      const getAnchorsResult = await getAnchorAssets(credentials);
      if (getAnchorsResult instanceof Error) {
        errorMessage = getAnchorsResult.message;
        throw getAnchorsResult;
      }

      const { anchorAssetIds } = getAnchorsResult;
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
        const getThemeResult = await getThemeEnvVars(theme.id);
        if (getThemeResult instanceof Error) throw getThemeResult;
        const { droppableAssets } = getThemeResult;

        const random = Math.floor(Math.random() * droppableAssets.length);
        const droppableAsset = droppableAssets[random];
        const {
          layer0,
          layer1,
          imageOffsetX,
          imageOffsetY,
          textOffsetX,
          textOffsetY,
          isTextTopLayer,
          textColor,
          textSize,
          textWidth,
          yOrderAdjust,
        } = droppableAsset;

        const { position } = droppedAsset;

        if (!layer0 && !layer1) {
          throw "Droppable asset layers not found. Please check environment variables.";
        }

        const webImageAsset = await Asset.create(process.env.IMG_ASSET_ID || "webImageAsset", {
          credentials,
        });
        await DroppedAsset.drop(webImageAsset, {
          position: {
            x: (position?.x || 0) + (parseInt(imageOffsetX) || 0),
            y: (position?.y || 0) + (parseInt(imageOffsetY) || 0),
          },
          isInteractive: true,
          interactivePublicKey,
          layer0,
          layer1,
          sceneDropId,
          uniqueName: `${sceneDropId}-background-${droppedAssetId}`,
          urlSlug,
        });

        let textPosition = { x: 0, y: 0 };
        if (position?.x) textPosition.x = Math.round(position.x);
        if (position?.y) textPosition.y = Math.round(position.y);
        if (textOffsetX) {
          if (typeof textOffsetX === "number") textPosition.x + textOffsetX;
          else textPosition.x = textPosition.x + parseInt(textOffsetX);
        } else {
          textPosition.x = textPosition.x - 1;
        }
        if (textOffsetY) {
          if (typeof textOffsetY === "number") textPosition.y + textOffsetY;
          else textPosition.y = textPosition.y + parseInt(textOffsetY);
        } else {
          textPosition.y = textPosition.y - 26;
        }

        const textAsset = await Asset.create(process.env.TEXT_ASSET_ID || "textAsset", {
          credentials,
        });
        await DroppedAsset.drop(textAsset, {
          position: textPosition,
          isInteractive: true,
          isTextTopLayer: !isTextTopLayer || isTextTopLayer === "true" ? true : false,
          interactivePublicKey,
          sceneDropId,
          text: addHyphenAndNewline(message),
          textColor: textColor || "white",
          textSize: parseInt(textSize) || 16,
          textWeight: "normal",
          textWidth: parseInt(textWidth) || 190,
          uniqueName: `${sceneDropId}-text-${droppedAssetId}`,
          urlSlug,
          yOrderAdjust: parseInt(yOrderAdjust) || 1000,
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

    delete messages[messageId];
    promises.push(
      keyAsset.updateDataObject(
        {
          messages,
          [`anchorAssets`]: updateAnchorAssets,
          [`usedSpaces`]: usedSpaces,
        },
        {
          analytics: [{ analyticName: `messageApprovals` }, { analyticName: `${theme.id}-messageApprovals` }],
          lock: { lockId: `success-${lockId}`, releaseLock: true },
        },
      ),
    );

    const world = World.create(urlSlug, { credentials });
    world.triggerParticle({ position: droppedAsset.position, name: "purpleSmoke_puff" }).catch((error: any) =>
      errorHandler({
        error,
        functionName: "handleApproveMessages",
        message: "Error triggering particle effects",
      }),
    );

    addNewRowToGoogleSheets([
      {
        identityId,
        displayName,
        event: `${theme.id}-messageApprovals`,
        urlSlug,
      },
    ]);

    await Promise.all(promises);

    return res.json(await getPendingMessages({ keyAsset }));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleApproveMessages",
      message: errorMessage,
      req,
      res,
    });
  }
};
