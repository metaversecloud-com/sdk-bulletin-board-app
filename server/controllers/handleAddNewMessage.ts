import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
} from "../utils";

export const handleAddNewMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, displayName, profileId, username } = credentials

    const droppedAsset = await getDroppedAssetDataObject(
      assetId,
      credentials
    );

    const message = {
      id: `${profileId}-${Date.now()}`,
      message: req.body.message,
      userId: profileId,
      userName: displayName || username,
      approved: false,
    };

    // const lockId = `${assetId}-messages-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    // droppedAsset.updateDataObject({ [`messages.${message.id}`]: message }, { lock: { lockId, releaseLock: true } });
    await droppedAsset.updateDataObject({ [`messages.${message.id}`]: message });

    // await droppedAsset.updateDataObject({ messages: { [message.id]: message } });

    // console.log("🚀 ~ >>>>>>:", await droppedAsset.fetchDataObject())

    return res.send(droppedAsset.dataObject.messages);
    // return res.send(await droppedAsset.fetchDataObject().messages);
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