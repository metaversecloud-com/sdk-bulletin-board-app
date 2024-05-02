import { Request, Response } from "express";
import { errorHandler, getCredentials, getPendingMessages, getWorldDataObject } from "../utils/index.js";
import { DataObjectType } from "../types.js";

export const handleGetUserMessages = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, sceneDropId } = credentials;

    const { dataObject } = await getWorldDataObject(credentials);
    const { messages } = dataObject as DataObjectType;

    const myMessages = await getPendingMessages({ messages, profileId, sceneDropId });

    return res.json(myMessages);
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
