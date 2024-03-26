import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials } from "../utils";
import { DataObjectType } from '../types';

export const handleUpdateTheme = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials

    const droppedAsset = await DroppedAsset.create(
      assetId,
      urlSlug,
      { credentials }
    );

    const lockId = `${assetId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await droppedAsset.updateDataObject({ "theme": req.body }, { lock: { lockId, releaseLock: true } });

    const dataObject: DataObjectType = droppedAsset.dataObject
    return res.send(dataObject.theme);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleAddNewMessage",
      message: "Error adding new message.",
      req,
      res,
    });
  }
};