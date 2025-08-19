import { Request, Response } from "express";
import { errorHandler, getCredentials, getKeyAssetDataObject, Visitor } from "../utils/index.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleGetGameState = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { visitorId, urlSlug } = credentials;

    const getKeyAssetResult = await getKeyAssetDataObject(credentials);
    if (getKeyAssetResult instanceof Error) throw getKeyAssetResult;

    const { dataObject } = getKeyAssetResult;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    return res.json({ theme: dataObject?.theme, isAdmin: visitor.isAdmin });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetGameState",
      message: "Error getting theme and visitor.",
      req,
      res,
    });
  }
};
