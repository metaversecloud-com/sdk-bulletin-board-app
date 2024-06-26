import { Request, Response } from "express";
import { errorHandler, getCredentials, getPendingMessages, uploadToS3 } from "../../utils/index.js";
import { getWorldDataObject } from "../../utils/index.js";
import { DataObjectType, MessageType } from "../../types.js";

export const handleAddNewMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { displayName, profileId, sceneDropId, urlSlug, username } = credentials;
    const { imageData, message } = req.body;

    const { dataObject, world } = await getWorldDataObject(credentials);
    const { theme } = dataObject as DataObjectType;

    const id = `${profileId}-${Date.now()}`;
    const newMessage: MessageType = {
      id,
      message,
      userId: profileId,
      displayName,
      username,
      approved: false,
    };

    if (imageData) {
      const { imageUrl, success } = await uploadToS3(imageData, id);
      if (!success) throw "Error uploading image.";
      newMessage.imageUrl = imageUrl;
    }

    await world.updateDataObject(
      {
        [`scenes.${sceneDropId}.messages.${newMessage.id}`]: newMessage,
      },
      {
        analytics: [
          { analyticName: `newMessages`, profileId, urlSlug, uniqueKey: profileId },
          { analyticName: `${theme.id}-newMessages`, profileId, urlSlug, uniqueKey: profileId },
        ],
      },
    );

    return res.json(await getPendingMessages({ profileId, sceneDropId, world }));
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
