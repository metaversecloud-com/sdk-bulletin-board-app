import { Request, Response } from "express";
import { errorHandler, getCredentials, removeSceneFromWorld } from "../../utils/index.js";

export const handleRemoveSceneFromWorld = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { theme } = req.body;

    await removeSceneFromWorld({ credentials, existingThemeId: theme.id });

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRemoveSceneFromWorld",
      message: "Error removing scene from world.",
      req,
      res,
    });
  }
};
