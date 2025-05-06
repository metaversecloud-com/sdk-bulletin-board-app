import { Request, Response } from "express";
import { errorHandler, getCredentials, removeSceneFromWorld, Visitor, World } from "../utils/index.js";

export const handleRemoveSceneFromWorld = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug, visitorId } = credentials;

    await removeSceneFromWorld(credentials);

    const promises: any[] = [];

    // close drawer and fire toast
    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });

    visitor.closeIframe(assetId).catch((error: any) =>
      errorHandler({
        error,
        functionName: "handleRemoveSceneFromWorld",
        message: "Error closing iframe",
      }),
    );

    await Promise.all(promises);

    visitor
      .fireToast({
        groupId: "RemoveScene",
        title: "Bulletin Board Removed",
        text: "You have successfully removed this Bulletin Board from your world.",
      })
      .catch((error) =>
        errorHandler({
          error,
          functionName: "handleEditDroppedAsset",
          message: "Error firing toast",
        }),
      );

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRemoveSceneFromWorld",
      message: "Error removing scene from world.",
      req,
      res,
    });
  }
};
