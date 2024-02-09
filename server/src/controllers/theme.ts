import {
  credentialsFromQuery,
  getDataObjectFromDroppedAsset,
} from "../../utils/common.js";
import { Request, Response } from "express";

export const theme = async (req: Request, res: Response) => {
  try {
    const credentials = credentialsFromQuery(req);
    const { dataObject } = await getDataObjectFromDroppedAsset(
      credentials.assetId,
      credentials
    );
    const theme = dataObject?.theme || {};
    return res.send({ theme: theme });
  } catch (error) {
    console.log(error);
    res.status(503).send("Error getting theme");
  }
};
