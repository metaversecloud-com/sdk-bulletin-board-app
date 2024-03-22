import { Request, Response } from "express";
import { DataObjectType } from "../types";
import { errorHandler, getCredentials, getDroppedAssetDataObject } from "../utils";

export const handleGetPendingMessages = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { dataObject } = await getDroppedAssetDataObject(credentials.assetId, credentials);
    console.log("🚀 ~ file: handleGetMyMessages.ts:16 ~ dataObject:", dataObject)

    const { messages } = dataObject as DataObjectType

    const approvedMessages = Object.entries(messages).reduce((approvedMessages, [key, message]) => {
      if (message.approved === false) {
        approvedMessages[key] = message;
      }
      return approvedMessages;
    }, {})
    console.log("🚀 ~ file: handleGetMyMessages.ts:21 ~ approvedMessages:", approvedMessages)

    return res.json({ messages: approvedMessages });
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
