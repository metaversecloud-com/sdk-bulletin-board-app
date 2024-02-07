import {
  credentialsFromQuery,
  getDataObjectFromDroppedAsset,
  getProfile,
  writeDataObjectToDroppedAssetId,
} from "../../utils/common.js";
import { Request, Response } from "express";

type NewMessage = {
  message: string;
};

export const addNewMessage = async (req: Request, res: Response) => {
  try {
    const credentials = credentialsFromQuery(req);

    const userData = await getProfile(credentials);
    const { dataObject } = await getDataObjectFromDroppedAsset(
      credentials.assetId,
      credentials
    );
    const newMessage: NewMessage = req.body;

    const messageObj = {
      id: `${Date.now()}-${userData.profileId}`,
      message: newMessage.message,
      userId: userData.profileId,
      userName: userData.displayName || userData.username,
      approved: false,
    };

    const messages = dataObject?.messages || [];
    messages.push(messageObj);

    const updatedData = {
      ...dataObject,
      messages,
    };

    await writeDataObjectToDroppedAssetId(
      credentials,
      credentials.assetId,
      updatedData
    );

    res.send(updatedData);
  } catch (error) {
    console.error("addNewMessageError", JSON.stringify(error));
  }
};

export const getMyMessages = async (req: Request, res: Response) => {
  try {
    const credentials = credentialsFromQuery(req);

    const userData = await getProfile(credentials);
    const { dataObject } = await getDataObjectFromDroppedAsset(
      credentials.assetId,
      credentials
    );

    if (dataObject?.messages === undefined)
      return res.json({ messages: [], isAdmin: userData.isAdmin });

    const myMessages = dataObject.messages.filter(
      (message: any) =>
        message.userId === userData.profileId && message.approved === false
    );
    res.json({ messages: myMessages, isAdmin: userData.isAdmin });
  } catch (error) {
    console.log(error);
    console.error("getMyMessages", JSON.stringify(error));
    res.status(503).send("Error getting messages");
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const credentials = credentialsFromQuery(req);

    const { id } = req.params;

    const { dataObject } = await getDataObjectFromDroppedAsset(
      credentials.assetId,
      credentials
    );

    const updatedMessages = dataObject.messages.filter(
      (message: any) => message.id !== id
    );
    const updatedData = {
      ...dataObject,
      messages: updatedMessages,
    };

    await writeDataObjectToDroppedAssetId(
      credentials,
      credentials.assetId,
      updatedData
    );

    res.send(updatedData);
  } catch (error) {
    console.log(error);
    console.error("deleteMessage", JSON.stringify(error));
  }
};
