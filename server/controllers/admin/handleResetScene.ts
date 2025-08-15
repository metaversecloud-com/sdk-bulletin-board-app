import { Request, Response } from "express";
import {
  errorHandler,
  getAnchorAssets,
  getCredentials,
  getPendingMessages,
  getThemeEnvVars,
  getKeyAssetDataObject,
  World,
} from "../../utils/index.js";
import { DataObjectType } from "../../types.js";

export const handleResetScene = async (req: Request, res: Response) => {
  let message = "Error resetting scene.";
  try {
    const { shouldHardReset } = req.body;
    const credentials = getCredentials(req.query);
    const { sceneDropId, urlSlug } = credentials;

    const world = World.create(urlSlug, { credentials });

    const getKeyAssetResult = await getKeyAssetDataObject(credentials);
    if (getKeyAssetResult instanceof Error) throw getKeyAssetResult;

    const { dataObject, keyAsset } = getKeyAssetResult;
    const { messages, theme } = dataObject as DataObjectType;

    const getAnchorsResult = await getAnchorAssets(credentials);
    if (getAnchorsResult instanceof Error) {
      message = getAnchorsResult.message;
      throw getAnchorsResult;
    }

    const { anchorAssets, anchorAssetIds } = getAnchorsResult;

    const lockId = `${sceneDropId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    if (shouldHardReset) {
      const getThemeResult = await getThemeEnvVars(theme.id);
      if (getThemeResult instanceof Error) throw getThemeResult;

      const { anchorAssetImage, theme: defaultTheme } = getThemeResult;

      const promises = [];

      if (defaultTheme.type === "image") {
        // TODO: decide if this should delete from s3
        /*
      To do so we'd need to loop through messages and find ones with imageUrl and delete those from s3
          if (message.imageUrl) {
            const { success } = await deleteFromS3(message.id);
            if (!success) throw "Error deleting image.";
          }
      */

        for (const droppedAsset of anchorAssets) {
          if (
            anchorAssetImage &&
            droppedAsset.uniqueName === "anchor" &&
            droppedAsset.bottomLayerURL !== anchorAssetImage
          ) {
            promises.push(droppedAsset.updateWebImageLayers(anchorAssetImage, ""));
          }
        }
      } else {
        const droppedAssetIds: string[] = [];

        const backgroundAssets = await world.fetchDroppedAssetsWithUniqueName({
          uniqueName: `${sceneDropId}-background-`,
          isPartial: true,
        });

        if (Object.keys(backgroundAssets).length > 0) {
          for (const index in backgroundAssets) {
            droppedAssetIds.push(backgroundAssets[index].id!);
          }
        }

        const textAssets = await world.fetchDroppedAssetsWithUniqueName({
          uniqueName: `${sceneDropId}-text-`,
          isPartial: true,
        });

        if (Object.keys(textAssets).length > 0) {
          for (const index in textAssets) {
            droppedAssetIds.push(textAssets[index].id!);
          }
        }

        promises.push(
          World.deleteDroppedAssets(urlSlug, droppedAssetIds, process.env.INTERACTIVE_SECRET!, credentials),
        );
      }

      await Promise.allSettled(promises);

      await keyAsset.updateDataObject(
        {
          anchorAssets: anchorAssetIds,
          messages: {},
          usedSpaces: [],
        },
        {
          analytics: [{ analyticName: `resets` }, { analyticName: `${theme.id}-resets` }],
          lock: { lockId, releaseLock: true },
        },
      );

      return res.json({});
    } else {
      await world.updateDataObject({ anchorAssets: anchorAssetIds }, { lock: { lockId, releaseLock: true } });

      return res.json(await getPendingMessages({ messages }));
    }
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleResetScene",
      message,
      req,
      res,
    });
  }
};
