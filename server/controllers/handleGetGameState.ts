import { Request, Response } from "express";
import { errorHandler, getCredentials, getKeyAssetDataObject, ThemeIds, Visitor, World } from "../utils/index.js";
import { DroppedAssetInterface, VisitorInterface } from "@rtsdk/topia";

/**
 * A theme is considered "available" in this ecosystem only if its
 * `SCENE_ID_<id>` env var is set — without that we have no scene template
 * to drop, so the option should be hidden from the admin theme switcher.
 * The canonical list of themes lives in `getThemeEnvVars.ts` as `ThemeIds`.
 */
const getAvailableThemeIds = (): string[] =>
  Object.values(ThemeIds).filter((id) => Boolean(process.env[`SCENE_ID_${id}`]));

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
      availableThemeIds: getAvailableThemeIds(),
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
