import { Request, Response } from "express";
import { DataObjectType } from "../types";
import { errorHandler, getCredentials, getDroppedAssetDataObject, getPendingMessages } from "../utils";

export const handleGetPendingMessages = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { dataObject } = await getDroppedAssetDataObject(credentials.assetId, credentials);

    const { messages } = dataObject as DataObjectType

    return res.json(await getPendingMessages(messages));
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
