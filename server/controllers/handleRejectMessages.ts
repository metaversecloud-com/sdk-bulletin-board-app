import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getPendingMessages,
  getWorldDataObject,
} from "../utils";

export const handleRejectMessages = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials
    const { messageId } = req.params;

    const { world } = await getWorldDataObject(credentials);

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await world.updateDataObject({ [`scenes.${sceneDropId}.messages.${messageId}.approved`]: false }, { lock: { lockId, releaseLock: true } });

    return res.json(await getPendingMessages({ sceneDropId, world }));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRejectMessages",
      message: "Error rejecting messages.",
      req,
      res,
    });
  }
};