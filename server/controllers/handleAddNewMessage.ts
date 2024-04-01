import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getPendingMessages,
  uploadToS3,
} from "../utils/index.js";
import { getWorldDataObject } from "../utils/getWorldDataObject.js";
import { MessageType } from "../types.js";

export const handleAddNewMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { displayName, profileId, sceneDropId, username } = credentials
    const { imageDataUrl, message } = req.body

    const { world } = await getWorldDataObject(credentials);

    const id = `${profileId}-${Date.now()}`
    const newMessage: MessageType = {
      id,
      message,
      userId: profileId,
      userName: displayName || username,
      approved: false,
    };

    if (imageDataUrl) {
      const result = await uploadToS3(imageDataUrl, id)
      if (result.error) throw "Error uploading image."
      newMessage.imageUrl = result
    }

    await world.updateDataObject({
      [`scenes.${sceneDropId}.messages.${newMessage.id}`]: newMessage,
    });

    return res.json(await getPendingMessages({ sceneDropId, world }));
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