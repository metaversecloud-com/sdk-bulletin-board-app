import { Request, Response } from "express";
import { errorHandler, getCredentials, getWorldDataObject } from "../utils/index.js";
import { DataObjectType } from '../types.js';

export const handleGetTheme = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { dataObject } = await getWorldDataObject(credentials);
    const { theme } = dataObject as DataObjectType;

    return res.send(theme);
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
