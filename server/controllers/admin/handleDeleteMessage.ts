import { Request, Response } from "express";
import { errorHandler, getCredentials, getPendingMessages, getKeyAssetDataObject } from "../../utils/index.js";
import { DataObjectType } from "../../types.js";
import { deleteMessage } from "../../utils/deleteMessage.js";

export const handleDeleteMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { messageId } = req.params;

    const getKeyAssetResult = await getKeyAssetDataObject(credentials);
    if (getKeyAssetResult instanceof Error) throw getKeyAssetResult;
    const { dataObject, keyAsset } = getKeyAssetResult;

    const { messages, theme } = dataObject as DataObjectType;

    try {
      await keyAsset.updateDataObject(
        {},
        {
          lock: {
            lockId: `${credentials.assetId}-${messageId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`,
          },
        },
      );
    } catch (error) {
      return res.status(409).json({ message: "Message is currently being deleted by another admin." });
    }

    await deleteMessage({ credentials, keyAsset, messageId, messages });

    keyAsset.updateDataObject(
      {},
      {
        analytics: [{ analyticName: `messageRejects` }, { analyticName: `${theme.id}-messageRejects` }],
      },
    );

    return res.json(await getPendingMessages({ keyAsset }));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleDeleteMessage",
      message: "Error deleting message.",
      req,
      res,
    });
  }
};
