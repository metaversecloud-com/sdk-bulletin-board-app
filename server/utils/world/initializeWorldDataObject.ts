import { DroppedAssetInterface } from "@rtsdk/topia";
import { DroppedAsset, errorHandler, getThemeEnvVars } from '../index.js';
import { Credentials } from "../../types.js";

interface DroppedAssetInterfaceI extends DroppedAssetInterface {
  dataObject: {
    themeId?: string
  }
}

export const initializeWorldDataObject = async ({ credentials, world }: { credentials: Credentials, world: any }) => {
  try {
    const { assetId, sceneDropId, urlSlug } = credentials
    await world.fetchDataObject();

    const payload = {
      anchorAssets: [],
      messages: {},
      placedAssets: [],
      theme: {},
      usedSpaces: [],
    };

    if (!world.dataObject?.scenes || !world.dataObject?.scenes?.[sceneDropId]) {
      const keyAsset = await DroppedAsset.create(assetId, urlSlug, { credentials }) as DroppedAssetInterfaceI
      await keyAsset.fetchDataObject();
      const themeId = keyAsset.dataObject?.themeId || process.env.DEFAULT_THEME || "CHALK"
      const { theme } = await getThemeEnvVars(themeId)
      payload.theme = theme

      const assetsList: DroppedAssetInterface[] = await world.fetchDroppedAssetsBySceneDropId({
        sceneDropId: credentials.sceneDropId,
      })
      // @ts-ignore
      payload.anchorAssets = assetsList
        .filter(a => a.uniqueName === "anchor")
        .map(({ id }) => (id));
    }

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
    } else if (!world.dataObject?.scenes?.[sceneDropId]) {
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