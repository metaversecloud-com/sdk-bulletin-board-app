import { DroppedAssetInterface } from "@rtsdk/topia";
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

    promises.push(
      visitor.closeIframe(assetId),
      visitor.fireToast({
        groupId: "RemoveScene",
        title: "Bulletin Board Removed",
        text: "You have successfully removed this Bulletin Board from your world.",
      })
    )

    await Promise.all(promises)

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
