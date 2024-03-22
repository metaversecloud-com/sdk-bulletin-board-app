import {
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
} from "../utils";
import { Request, Response } from "express";

export const handleDeleteMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { id } = req.params;

    const droppedAsset = await getDroppedAssetDataObject(credentials.assetId, credentials);

    const { messages } = droppedAsset.dataObject;

    delete messages[id]

    await droppedAsset.updateDataObject({ messages });

    return res.send(await droppedAsset.fetchDataObject().messages);
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
