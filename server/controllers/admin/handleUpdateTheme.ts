import { Request, Response } from "express";
import {
  DroppedAsset,
  errorHandler,
  getCredentials,
  getThemeEnvVars,
  getWorldDataObject,
  removeSceneFromWorld,
  Visitor,
  World,
} from "../../utils/index.js";
import { IDroppedAsset } from "../../types.js";

export const handleUpdateTheme = async (req: Request, res: Response) => {
  try {
    const { existingThemeId, id } = req.body;
    const credentials = getCredentials(req.query);
    const { assetId, sceneDropId, urlSlug, visitorId } = credentials;

    const lockId = `${sceneDropId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    if (existingThemeId && existingThemeId !== id) {
      const { sceneId } = await getThemeEnvVars(id);
      if (!sceneId) throw `Missing required SCENE_ID_${id} theme environment variables in the .env file`;

      const [droppedAsset, world, visitor] = await Promise.all([
        DroppedAsset.create(assetId, urlSlug, { credentials }),
        World.create(urlSlug, { credentials }),
        Visitor.create(visitorId, urlSlug, { credentials }),
      ]);

      const allDroppedAssets = (await world.fetchDroppedAssetsBySceneDropId({
        sceneDropId,
      })) as IDroppedAsset[];

      const containerAsset = allDroppedAssets?.find((asset) => {
        return asset.uniqueName === "bulletin-board-container";
      });

      let position = containerAsset?.position;
      if (!position) {
        const { dataObject } = await getWorldDataObject(credentials);
        position = dataObject.sceneDropPosition;
        if (!position)
          throw `Now position found. Please add a "bulletin-board-container" dropped asset or set a position in the world data object.`;
      }

      await removeSceneFromWorld({ credentials, shouldRemoveKeyAsset: false, themeId: existingThemeId });

      visitor.closeIframe(assetId).catch((error: any) =>
        errorHandler({
          error,
          functionName: "handleUpdateTheme",
          message: "Error closing iframe",
        }),
      );

      await world.dropScene({
        allowNonAdmins: true,
        sceneId,
        position,
        sceneDropId,
      });

      droppedAsset.deleteDroppedAsset();

      world.setDataObject(
        { [`scenes.${sceneDropId}`]: { sceneDropPosition: position } },
        { lock: { lockId, releaseLock: true } },
      );

      return res.send({});
    }

    const { world } = await getWorldDataObject(credentials);

    await world.updateDataObject(
      { [`scenes.${sceneDropId}.theme`]: req.body },
      { lock: { lockId, releaseLock: true } },
    );

    return res.send(req.body);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleUpdateTheme",
      message: "Error updating theme.",
      req,
      res,
    });
  }
};
