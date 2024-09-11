import { Request, Response } from "express";
import { errorHandler, getCredentials, getWorldDataObject } from "../../utils/index.js";

export const handleUpdateTheme = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials;

    // const { existingThemeId, id } = req.body;
    // const credentials = getCredentials(req.query);
    // const { assetId, sceneDropId, urlSlug } = credentials;

    // if (existingThemeId && existingThemeId !== id) {
    //   const { sceneId } = await getThemeEnvVars(id);
    //   if (!sceneId) throw `Missing required SCENE_ID_${id} theme environment variables in the .env file`;

    //   const { position } = await DroppedAsset.get(assetId, urlSlug, { credentials });

    //   await removeSceneFromWorld(credentials);

    //   const world = World.create(urlSlug, { credentials });
    //   await world.dropScene({
    //     sceneId,
    //     position: position!,
    //     assetSuffix: "message",
    //   });

    //   return res.send({});
    // }

    const { world } = await getWorldDataObject(credentials);

    const lockId = `${sceneDropId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
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
