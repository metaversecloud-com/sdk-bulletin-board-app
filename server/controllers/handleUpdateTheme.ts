import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, getWorldDataObject } from "../utils/index.js";
import { DataObjectType } from '../types.js';

export const handleUpdateTheme = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials

    const { world } = await getWorldDataObject(credentials);

    const lockId = `${sceneDropId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await world.updateDataObject({ [`scenes.${sceneDropId}.theme`]: req.body }, { lock: { lockId, releaseLock: true } });

    return res.send(req.body);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleAddNewMessage",
      message: "Error adding new message.",
      req,
      res,
    });
  }
};