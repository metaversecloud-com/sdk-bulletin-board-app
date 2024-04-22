import { Request, Response } from "express";
import { deleteFromS3, errorHandler, getCredentials, getPendingMessages, getWorldDataObject } from "../utils/index.js";
import { DataObjectType } from "../types.js";

export const handleDeleteMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials;
    const { messageId } = req.params;

    const { dataObject, world } = await getWorldDataObject(credentials);
    const { messages } = dataObject as DataObjectType;

    const message = messages[messageId];
    if (!message) throw new Error("Message not found");

    if (message.imageUrl) {
      const { success } = await deleteFromS3(message.id);
      if (!success) throw "Error deleting image.";
    }

    delete messages[messageId];

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await world.updateDataObject(
      {
        [`scenes.${sceneDropId}.messages`]: messages,
      },
      { lock: { lockId, releaseLock: true } },
    );

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
