import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
  getPendingMessages,
} from "../utils";

export const handleRejectMessages = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const credentials = getCredentials(req.query);

    const droppedAsset = await getDroppedAssetDataObject(credentials.assetId, credentials);

    const lockId = `${credentials.assetId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await droppedAsset.updateDataObject({ [`messages.${messageId}.approved`]: false }, { lock: { lockId, releaseLock: true } });

    return res.send(await getPendingMessages(droppedAsset.dataObject.messages));
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