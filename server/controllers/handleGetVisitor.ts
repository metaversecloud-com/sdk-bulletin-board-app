import { Request, Response } from "express";
import { errorHandler, getCredentials, Visitor } from "../utils/index.js";

export const handleGetVisitor = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { visitorId, urlSlug } = credentials;

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });

    return res.json({ visitor, success: true });
  } catch (error) {
    return errorHandler({ error, functionName: "handleGetVisitor", message: "Error getting visitor", req, res });
  }
};
