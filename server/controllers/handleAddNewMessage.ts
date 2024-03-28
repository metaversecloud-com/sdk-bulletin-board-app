import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getPendingMessages,
} from "../utils/index.js";
import { getWorldDataObject } from "../utils/getWorldDataObject.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

export const handleAddNewMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { displayName, profileId, sceneDropId, username } = credentials
    const { image, message } = req.body

    const { world } = await getWorldDataObject(credentials);

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