import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getPendingMessages,
  getThemeEnvVars,
  getWorldDataObject,
  World,
} from "../../utils/index.js";
import { DataObjectType } from "../../types.js";
import { DroppedAssetInterface } from "@rtsdk/topia";

export const handleResetScene = async (req: Request, res: Response) => {
  try {
    const { shouldHardReset } = req.body;
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials;

    const { dataObject, world } = await getWorldDataObject(credentials);
    const { messages, theme } = dataObject as DataObjectType;

    const anchorAssets: DroppedAssetInterface[] = await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId: credentials.sceneDropId,
      uniqueName: "anchor",
    });
    const anchorAssetIds = anchorAssets.map(({ id }) => id);

    const lockId = `${sceneDropId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    if (shouldHardReset) {
      // TODO: decide if this should delete from s3
      const { anchorAssetImage, theme: defaultTheme } = getThemeEnvVars(theme.id);
      const promises = [];
      if (defaultTheme.type === "image") {
        for (const droppedAsset of anchorAssets) {
          if (droppedAsset.uniqueName === "anchor" && droppedAsset.bottomLayerURL !== anchorAssetImage) {
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
            droppedAssetIds.push(backgroundAssets[index].id);
          }
        }

        const textAssets = await world.fetchDroppedAssetsWithUniqueName({
          uniqueName: `${sceneDropId}-text-`,
          isPartial: true,
        });

        if (Object.keys(textAssets).length > 0) {
          for (const index in textAssets) {
            droppedAssetIds.push(textAssets[index].id);
          }
        }

        promises.push(
          World.deleteDroppedAssets(credentials.urlSlug, droppedAssetIds, process.env.INTERACTIVE_SECRET!, credentials),
        );
      }

      await Promise.allSettled(promises);

      await world.updateDataObject(
        {
          [`scenes.${sceneDropId}.anchorAssets`]: anchorAssetIds,
          [`scenes.${sceneDropId}.messages`]: {},
          [`scenes.${sceneDropId}.placedAssets`]: [],
          [`scenes.${sceneDropId}.usedSpaces`]: [],
        },
        {
          analytics: [{ analyticName: `resets` }, { analyticName: `${theme.id}-resets` }],
          lock: { lockId, releaseLock: true },
        },
      );

      return res.json({});
    } else {
      await world.updateDataObject(
        { [`scenes.${sceneDropId}.anchorAssets`]: anchorAssetIds },
        { lock: { lockId, releaseLock: true } },
      );

      return res.json(await getPendingMessages({ messages, sceneDropId }));
    }
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleResetScene",
      message: "Error resetting scene.",
      req,
      res,
    });
  }
};
