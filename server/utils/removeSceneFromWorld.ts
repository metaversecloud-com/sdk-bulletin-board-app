import { DroppedAssetInterface } from "@rtsdk/topia";
import { Credentials } from "../types.js";
import { errorHandler, getThemeEnvVars, World } from "../utils/index.js";

export const removeSceneFromWorld = async ({
  credentials,
  shouldRemoveKeyAsset,
  themeId,
}: {
  credentials: Credentials;
  shouldRemoveKeyAsset: boolean;
  themeId: string;
}) => {
  try {
    const { assetId, sceneDropId, urlSlug } = credentials;

    const world = await World.create(urlSlug, { credentials });
    const droppedAssets: DroppedAssetInterface[] = await world.fetchDroppedAssetsBySceneDropId({ sceneDropId });

    const promises: any[] = [];

    // remove dropped assets
    if (Object.keys(droppedAssets).length > 0) {
      const droppedAssetIds: string[] = [];
      for (const index in droppedAssets) {
        if (shouldRemoveKeyAsset || droppedAssets[index].id !== assetId) droppedAssetIds.push(droppedAssets[index].id!);
      }
      promises.push(World.deleteDroppedAssets(urlSlug, droppedAssetIds, process.env.INTERACTIVE_SECRET!, credentials));
    }

    const { theme } = await getThemeEnvVars(themeId);

    if (shouldRemoveKeyAsset) {
      promises.push(
        world.updateDataObject(
          {
            [`scenes.${sceneDropId}`]: `${theme.title} removed from world on ${new Date()}`,
          },
          {
            lock: {
              lockId: `${urlSlug}-${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`,
            },
          },
        ),
      );
    }

    await Promise.allSettled(promises);

    return { success: true };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "removeSceneFromWorld",
      message: "Error removing scene from world.",
    });
  }
};
