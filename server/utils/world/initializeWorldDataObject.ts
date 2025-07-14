import { DroppedAsset, errorHandler, getAnchorAssets, getThemeEnvVars } from "../index.js";
import { Credentials, DataObjectType, IDroppedAsset } from "../../types.js";

export const initializeWorldDataObject = async ({ credentials, world }: { credentials: Credentials; world: any }) => {
  try {
    const { assetId, sceneDropId, urlSlug } = credentials;
    await world.fetchDataObject();

    if (world.dataObject?.scenes?.[sceneDropId]?.theme?.id) return;

    const payload: DataObjectType = {
      anchorAssets: [],
      messages: {},
      theme: {
        id: "",
        description: "",
        subtitle: "",
        title: "",
        type: "",
      },
      usedSpaces: [],
    };

    if (world.dataObject?.scenes?.[sceneDropId]?.sceneDropPosition) {
      payload.sceneDropPosition = world.dataObject?.scenes?.[sceneDropId].sceneDropPosition;
    }

    const keyAsset = (await DroppedAsset.create(assetId, urlSlug, { credentials })) as IDroppedAsset;
    await keyAsset.fetchDataObject();

    const themeId = keyAsset.dataObject?.themeId || process.env.DEFAULT_THEME || "CHALK";
    const { theme } = await getThemeEnvVars(themeId);
    payload.theme = { ...theme, ...keyAsset.dataObject?.theme };

    if (!payload.sceneDropPosition) payload.sceneDropPosition = keyAsset.dataObject?.sceneDropPosition;

    const { anchorAssetIds } = await getAnchorAssets(sceneDropId, world);
    payload.anchorAssets = anchorAssetIds;

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!world.dataObject?.scenes) {
      await world.setDataObject(
        {
          scenes: {
            [sceneDropId]: { ...payload },
          },
        },
        { lock: { lockId, releaseLock: true } },
      );
    } else {
      await world.updateDataObject(
        {
          [`scenes.${sceneDropId}`]: { ...payload },
        },
        { lock: { lockId, releaseLock: true } },
      );
    }
    return;
  } catch (error) {
    errorHandler({
      error,
      functionName: "initializeWorldDataObject",
      message: "Error initializing world data object",
    });
    return await world.fetchDataObject();
  }
};
