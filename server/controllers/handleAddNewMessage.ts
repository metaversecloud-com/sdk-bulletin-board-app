import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getPendingMessages,
  uploadToS3,
} from "../utils/index.js";
import { getWorldDataObject } from "../utils/getWorldDataObject.js";

export const handleAddNewMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { displayName, profileId, sceneDropId, username } = credentials
    const { imageUrl, message } = req.body
    console.log("🚀 ~ file: handleAddNewMessage.ts:15 ~ req.body:", req.body)

    const { world } = await getWorldDataObject(credentials);

    const id = `${profileId}-${Date.now()}`
    const newMessage = {
      id,
      message,
      imageUrl,
      userId: profileId,
      userName: displayName || username,
      approved: false,
    };

    // if (image) {
    //   const result = await uploadToS3(image, id)
    //   if (result.error) throw "Error uploading image."
    //   newMessage.imageUrl = result
    // }

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