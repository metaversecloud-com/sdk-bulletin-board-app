import {
  errorHandler,
  getCredentials,
  getWorldDataObject,
} from "../utils/index.js";
import { Request, Response } from "express";
import { DataObjectType } from "../types.js";

export const handleGetUserMessages = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { dataObject } = await getWorldDataObject(credentials);
    const { messages } = dataObject as DataObjectType;

    const myMessages = Object.entries(messages).reduce((myMessages, [key, message]) => {
      if (message.userId === credentials.profileId && message.approved === false) {
        myMessages[key] = message;
      }
      return myMessages;
    }, {})

    return res.json({ messages: myMessages });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetUserMessages",
      message: "Error getting my messages.",
      req,
      res,
    });
  }
};
