import { Credentials, IDroppedAsset, ThemeType } from "../types.js";
import { DroppedAsset, errorHandler, getThemeEnvVars, Visitor, World } from "../utils/index.js";

export const removeSceneFromWorld = async ({ credentials, theme }: { credentials: Credentials; theme?: ThemeType }) => {
  try {
    const { assetId, sceneDropId, urlSlug, visitorId } = credentials;

    const [keyAsset, visitor, world] = await Promise.all([
      DroppedAsset.create(assetId, urlSlug, { credentials }),
      Visitor.create(visitorId, urlSlug, { credentials }),
      World.create(urlSlug, { credentials }),
    ]);

    const droppedAssets = (await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId,
    })) as IDroppedAsset[];

    const containerAsset = droppedAssets?.find((asset) => {
      return asset.uniqueName === "bulletin-board-container";
    });

    let position = containerAsset?.position;

    if (theme?.id && !position) {
      throw "No position found. Please add a dropped asset with the unique name 'bulletin-board-container' or set a position in the world data object.";
    }

    const promises: any[] = [];

    if (Object.keys(droppedAssets).length > 0) {
      const droppedAssetIds: string[] = [];
      for (const index in droppedAssets) {
        if (droppedAssets[index].id !== assetId) droppedAssetIds.push(droppedAssets[index].id!);
      }
      promises.push(World.deleteDroppedAssets(urlSlug, droppedAssetIds, process.env.INTERACTIVE_SECRET!, credentials));
    }

    await Promise.allSettled(promises);

    visitor.closeIframe(assetId).catch((error: any) =>
      errorHandler({
        error,
        functionName: "handleUpdateTheme",
        message: "Error closing iframe",
      }),
    );

    if (theme?.id) {
      const getThemeResult = await getThemeEnvVars(theme.id);
      if (getThemeResult instanceof Error) throw getThemeResult;

      const { sceneId } = getThemeResult;
      if (!sceneId) throw "No sceneId found in theme environment variables.";

      await world.dropScene({
        allowNonAdmins: true,
        sceneId,
        position: position!,
        sceneDropId,
      });
    }

    keyAsset.deleteDroppedAsset();

    return { success: true };
  } catch (error: any) {
    return new Error(error);
  }
};
