import { Request, Response } from "express";
import { errorHandler, getCredentials, getPendingMessages, getKeyAssetDataObject } from "../../utils/index.js";
import { DataObjectType } from "../../types.js";

export const handleGetUserMessages = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId } = credentials;

    const getKeyAssetResult = await getKeyAssetDataObject(credentials);
    if (getKeyAssetResult instanceof Error) throw getKeyAssetResult;

    const { dataObject } = getKeyAssetResult;
    const { messages } = dataObject as DataObjectType;

    const myMessages = await getPendingMessages({ messages, profileId });

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
