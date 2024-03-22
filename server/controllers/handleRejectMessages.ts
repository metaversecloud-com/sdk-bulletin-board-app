import { Request, Response } from "express";
import {
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
} from "../utils";

export const handleRejectMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const credentials = getCredentials(req.query);

    const droppedAsset = await getDroppedAssetDataObject(credentials.assetId, credentials);

    await droppedAsset.updateDataObject({ [`messages[${id}].approved`]: false });

    return res.send(await droppedAsset.fetchDataObject().messages);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRejectMessages",
      message: "Error rejecting messages.",
      req,
      res,
    });
  }
};