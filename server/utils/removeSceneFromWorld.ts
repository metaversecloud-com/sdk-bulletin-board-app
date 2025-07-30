import { Credentials, IDroppedAsset, ThemeType } from "../types.js";
import { DroppedAsset, errorHandler, getThemeEnvVars, getWorldDataObject, Visitor, World } from "../utils/index.js";

export const removeSceneFromWorld = async ({
  credentials,
  existingThemeId,
  theme,
}: {
  credentials: Credentials;
  existingThemeId: string;
  theme?: ThemeType;
}) => {
  try {
    const { assetId, sceneDropId, urlSlug, visitorId } = credentials;

    const [droppedAsset, visitor] = await Promise.all([
      DroppedAsset.create(assetId, urlSlug, { credentials }),
      Visitor.create(visitorId, urlSlug, { credentials }),
    ]);

    const { dataObject, world } = await getWorldDataObject(credentials);

    const lockId = `${sceneDropId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;

    const droppedAssets = (await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId,
    })) as IDroppedAsset[];

    const containerAsset = droppedAssets?.find((asset) => {
      return asset.uniqueName === "bulletin-board-container";
    });

    let position = containerAsset?.position;

    if (theme?.id && !position) {
      position = dataObject.sceneDropPosition;
      if (!position) {
        throw `No position found. Please add a "bulletin-board-container" dropped asset or set a position in the world data object.`;
      }
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
      const { sceneId } = await getThemeEnvVars(theme.id);

      await Promise.all([
        world.dropScene({
          allowNonAdmins: true,
          sceneId,
          position,
          sceneDropId,
        }),
        world.updateDataObject(
          {
            [`scenes.${sceneDropId}`]: {
              sceneDropPosition: position,
            },
          },
          { lock: { lockId, releaseLock: true } },
        ),
      ]);
    } else {
      const { theme: existingTheme } = await getThemeEnvVars(existingThemeId);
      world.updateDataObject(
        { [`scenes.${sceneDropId}`]: `${existingTheme.title} removed from world on ${new Date()}` },
        { lock: { lockId, releaseLock: true } },
      );
    }

    droppedAsset.deleteDroppedAsset();

    return { success: true };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "removeSceneFromWorld",
      message: "Error removing scene from world.",
    });
  }
};
