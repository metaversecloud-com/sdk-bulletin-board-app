import { DroppedAssetInterface } from "@rtsdk/topia";
import { DroppedAsset, errorHandler, getAnchorAssets, getThemeEnvVars } from "../index.js";
import { Credentials, DataObjectType } from "../../types.js";

interface DroppedAssetInterfaceI extends DroppedAssetInterface {
  dataObject: {
    themeId?: string;
  };
}

export const initializeWorldDataObject = async ({ credentials, world }: { credentials: Credentials; world: any }) => {
  try {
    const { assetId, sceneDropId, urlSlug } = credentials;
    await world.fetchDataObject();

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

    // TODO: update so that sceneDropId is new when theme is switched
    if (!world.dataObject?.scenes || !world.dataObject?.scenes?.[sceneDropId]?.theme) {
      const keyAsset = (await DroppedAsset.create(assetId, urlSlug, { credentials })) as DroppedAssetInterfaceI;
      await keyAsset.fetchDataObject();
      const themeId = keyAsset.dataObject?.themeId || process.env.DEFAULT_THEME || "CHALK";
      const { theme } = await getThemeEnvVars(themeId);
      payload.theme = theme;

      const { anchorAssetIds } = await getAnchorAssets(sceneDropId, world);
      payload.anchorAssets = anchorAssetIds;
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
    } else if (!world.dataObject?.scenes?.[sceneDropId]?.theme) {
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
