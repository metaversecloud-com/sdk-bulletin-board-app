import { DroppedAssetInterface } from "@rtsdk/topia";
import { errorHandler } from "./errorHandler.js";
import { getThemeEnvVars } from './getThemeEnvVars.js';
import { Credentials } from "../types.js";
import { DroppedAsset } from "./topiaInit.js";

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

    if (!world.dataObject || !world.dataObject?.scenes || !world.dataObject?.scenes?.[sceneDropId]) {
      const keyAsset = await DroppedAsset.create(assetId, urlSlug, { credentials }) as DroppedAssetInterfaceI
      await keyAsset.fetchDataObject();
      const themeId = keyAsset.dataObject?.themeId || process.env.DEFAULT_THEME
      const { theme } = await getThemeEnvVars(themeId)
      payload.theme = theme

      const assetsList = await world.fetchDroppedAssetsBySceneDropId({
        sceneDropId: credentials.sceneDropId,
      })
      payload.anchorAssets = assetsList
        .filter(a => a.uniqueName === "anchor")
        .map(({ id }) => (id));
    }

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!world.dataObject || !world.dataObject?.scenes) {
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