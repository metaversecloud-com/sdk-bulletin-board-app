import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAssetDataObject } from "../utils";

export const handleGetTheme = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { dataObject } = await getDroppedAssetDataObject(credentials.assetId, credentials);

    console.log("🚀 ~ file: handleGetTheme.ts:16 ~ dataObject:", dataObject)
    const theme = dataObject?.theme || {};

    return res.send({ theme });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetTheme",
      message: "Error getting theme.",
      req,
      res,
    });
  }
};
