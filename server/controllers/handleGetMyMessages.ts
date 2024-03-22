import {
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
} from "../utils";
import { Request, Response } from "express";
import { DataObjectType } from "../types";

export const handleGetMyMessages = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId } = credentials

    const { dataObject } = await getDroppedAssetDataObject(assetId, credentials);
    const { messages } = dataObject as DataObjectType

    const myMessages = Object.entries(messages).reduce((myMessages, [key, message]) => {
      if (message.userId === profileId && message.approved === false) {
        myMessages[key] = message;
      }
      return myMessages;
    }, {})

    return res.json({ messages: myMessages });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetMyMessages",
      message: "Error getting my messages.",
      req,
      res,
    });
  }
};
