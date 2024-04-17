import { Request, Response } from "express";
import { DataObjectType } from "../types.js";
import { errorHandler, getCredentials, getPendingMessages, getWorldDataObject } from "../utils/index.js";

export const handleGetPendingMessages = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials;

    const { dataObject } = await getWorldDataObject(credentials);
    const { messages } = dataObject as DataObjectType;

    return res.json(await getPendingMessages({ messages, sceneDropId }));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetPendingMessages",
      message: "Error getting pending messages.",
      req,
      res,
    });
  }
};
