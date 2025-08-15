import { Request, Response } from "express";
import { errorHandler, getCredentials, getPendingMessages, getKeyAssetDataObject } from "../../utils/index.js";
import { DataObjectType } from "../../types.js";
import { deleteMessage } from "../../utils/deleteMessage.js";

export const handleDeleteUserMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId } = credentials;
    const { messageId } = req.params;

    const getKeyAssetResult = await getKeyAssetDataObject(credentials);
    if (getKeyAssetResult instanceof Error) throw getKeyAssetResult;

    const { dataObject, keyAsset } = getKeyAssetResult;
    const { messages } = dataObject as DataObjectType;

    await deleteMessage({ credentials, messageId, messages, keyAsset });

    return res.json(await getPendingMessages({ profileId, keyAsset }));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleDeleteUserMessage",
      message: "Error deleting message.",
      req,
      res,
    });
  }
};
