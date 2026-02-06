import { Request, Response } from "express";
import { errorHandler, getCredentials, getKeyAssetDataObject, Visitor, World } from "../utils/index.js";
import { DroppedAssetInterface, VisitorInterface } from "@rtsdk/topia";

export const handleGetGameState = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId, visitorId, urlSlug } = credentials;

    const { dataObject } = await getKeyAssetDataObject(credentials);

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    const world = await World.create(urlSlug, { credentials });
    const droppedAssets = (await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId,
    })) as DroppedAssetInterface[];
    const containerAsset = droppedAssets?.find((asset) => {
      return asset.uniqueName === "bulletin-board-container";
    });

    return res.json({
      theme: dataObject?.theme,
      isAdmin: visitor.isAdmin,
      canSwitchScenes: containerAsset !== undefined,
    });
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
