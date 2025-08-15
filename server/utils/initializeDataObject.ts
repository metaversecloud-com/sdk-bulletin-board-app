import { getAnchorAssets, getThemeEnvVars, World } from "./index.js";
import { Credentials, DataObjectType, IDroppedAsset } from "../types.js";

type WorldDataObject = {
  scenes: {
    [key: string]: DataObjectType;
  };
};

export const initializeDataObject = async ({
  credentials,
  keyAsset,
}: {
  credentials: Credentials;
  keyAsset: IDroppedAsset;
}) => {
  try {
    const { assetId, sceneDropId, urlSlug } = credentials;

    await keyAsset.fetchDataObject();

    if (keyAsset.dataObject?.theme?.id) return;

    let payload: DataObjectType = {
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

    const lockId = `${assetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;

    const world = World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    let worldDataObject = world.dataObject as WorldDataObject;

    if (!worldDataObject?.scenes?.[sceneDropId]?.theme) {
      const themeId = keyAsset.dataObject?.themeId || process.env.DEFAULT_THEME || "CHALK";
      const getThemeResult = await getThemeEnvVars(themeId);
      if (getThemeResult instanceof Error) throw getThemeResult;
      payload.theme = getThemeResult.theme;

      const getAnchorsResult = await getAnchorAssets(credentials);
      if (getAnchorsResult instanceof Error) throw getAnchorsResult;
      payload.anchorAssets = getAnchorsResult.anchorAssetIds;
    } else {
      // existing scene data object found in world, transfer to key asset's data object
      payload = worldDataObject.scenes[sceneDropId];

      await world.updateDataObject(
        {
          [`scenes.${sceneDropId}`]: `Data transferred to key asset on ${new Date()}`,
        },
        { lock: { lockId, releaseLock: true } },
      );
    }

    if (keyAsset.dataObject) {
      await keyAsset.updateDataObject({ ...payload }, { lock: { lockId, releaseLock: true } });
    } else {
      await keyAsset.setDataObject({ ...payload }, { lock: { lockId, releaseLock: true } });
    }

    await keyAsset.fetchDataObject();

    return;
  } catch (error: any) {
    return new Error(error);
  }
};
