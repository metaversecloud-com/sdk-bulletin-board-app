import {
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
  getPendingMessages,
} from "../utils";
import { Request, Response } from "express";

export const handleDeleteMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { messageId } = req.params;

    const droppedAsset = await getDroppedAssetDataObject(credentials.assetId, credentials);

    const { messages } = droppedAsset.dataObject;

    console.log("🚀 ~ file: handleDeleteMessage.ts:33 ~ messages[id]:", messages[messageId])
    delete messages[messageId]

    console.log("🚀 ~ file: handleDeleteMessage.ts:21 ~ messages:", messages)
    const lockId = `${credentials.assetId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await droppedAsset.updateDataObject({ messages }, { lock: { lockId, releaseLock: true } });

    return res.send(await getPendingMessages(droppedAsset.dataObject.messages));
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
