import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
  getPendingMessages,
} from "../utils";
import { uploadToS3 } from "../utils/uploadToS3";

export const handleAddNewMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, displayName, profileId, username } = credentials
    const { image, message } = req.body
    console.log("🚀 ~ file: handleAddNewMessage.ts:14 ~ req.body:", req.body)

    const droppedAsset = await getDroppedAssetDataObject(
      assetId,
      credentials
    );

    const newMessage = {
      id: `${profileId}-${Date.now()}`,
      message,
      imageUrl: "",
      userId: profileId,
      userName: displayName || username,
      approved: false,
    };

    if (image) {
      const result = await uploadToS3(image, `${profileId}-${Date.now()}`)
      newMessage.imageUrl = result
    }

    await droppedAsset.updateDataObject({ [`messages.${newMessage.id}`]: newMessage });

    return res.send(await getPendingMessages(droppedAsset.dataObject.messages));
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