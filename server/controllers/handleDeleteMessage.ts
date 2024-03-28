import {
  errorHandler,
  getCredentials,
  getPendingMessages,
  getWorldDataObject,
} from "../utils/index.js";
import { Request, Response } from "express";
import { DataObjectType } from "../types.js";

export const handleDeleteMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials
    const { messageId } = req.params;

    const { dataObject, world } = await getWorldDataObject(credentials);
    const { messages } = dataObject as DataObjectType;

    delete messages[messageId]

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await world.updateDataObject({
      [`scenes.${sceneDropId}.messages`]: messages
    }, { lock: { lockId, releaseLock: true } });

    return res.json(await getPendingMessages({ sceneDropId, world }));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleDeleteMessage",
      message: "Error deleting message.",
      req,
      res,
    });
  }
};
