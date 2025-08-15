import { Request, Response } from "express";
import { errorHandler, getCredentials, getWorldDataObject, removeSceneFromWorld } from "../../utils/index.js";

export const handleUpdateTheme = async (req: Request, res: Response) => {
  try {
    const { existingThemeId, id } = req.body;
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials;

    const lockId = `${sceneDropId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    if (existingThemeId && existingThemeId !== id) {
      await removeSceneFromWorld({ credentials, existingThemeId, theme: req.body });
    } else {
      const { world } = await getWorldDataObject(credentials);

      await world.updateDataObject(
        { [`scenes.${sceneDropId}.theme`]: req.body },
        { lock: { lockId, releaseLock: true } },
      );
    }

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
