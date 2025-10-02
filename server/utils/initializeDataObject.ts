import { getAnchorAssets, getThemeEnvVars, World } from "./index.js";
import { Credentials, DataObjectType, IDroppedAsset } from "../types.js";

type WorldDataObject = {
  missingScenesDeleted?: boolean;
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

    if (keyAsset.dataObject?.theme?.id) return keyAsset.dataObject;

    let keyAssetPayload: DataObjectType = {
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

    const world = World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    let worldDataObject = world.dataObject as WorldDataObject;
    const worldPayload = worldDataObject as any;
    let shouldUpdateWorldDataObject = false;

    if (worldPayload && !worldPayload?.missingScenesDeleted) {
      await world.fetchScenes();
      if (world.scenes) {
        const worldScenes: { [key: string]: any } = world.scenes;
        const sceneKeys = worldPayload.scenes ? Object.keys(worldPayload.scenes) : [];
        for (const sceneId of sceneKeys) {
          if (!worldScenes[sceneId]) {
            delete worldDataObject.scenes[sceneId];
            shouldUpdateWorldDataObject = true;
          }
        }
      }
    }

    if (!worldDataObject?.scenes?.[sceneDropId]?.theme) {
      const themeId = keyAsset.dataObject?.themeId || process.env.DEFAULT_THEME || "CHALK";
      const getThemeResult = await getThemeEnvVars(themeId);
      if (getThemeResult instanceof Error) throw getThemeResult;
      keyAssetPayload.theme = getThemeResult.theme;

      const getAnchorsResult = await getAnchorAssets(credentials);
      if (getAnchorsResult instanceof Error) throw getAnchorsResult;
      keyAssetPayload.anchorAssets = getAnchorsResult.anchorAssetIds;
    } else {
      // existing scene data object found in world, transfer to key asset's data object
      keyAssetPayload = worldDataObject.scenes[sceneDropId];
      shouldUpdateWorldDataObject = true;
    }

    const lockId = `${assetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;

    if (keyAsset.dataObject) {
      await keyAsset.updateDataObject({ ...keyAssetPayload }, { lock: { lockId, releaseLock: true } });
    } else {
      await keyAsset.setDataObject({ ...keyAssetPayload }, { lock: { lockId, releaseLock: true } });
    }

    await keyAsset.fetchDataObject();

    if (shouldUpdateWorldDataObject) {
      worldPayload.missingScenesDeleted = true;
      worldPayload.scenes[sceneDropId] = `Data transferred to key asset on ${new Date()}`;
      world.updateDataObject(worldPayload, { lock: { lockId, releaseLock: true } });
    }

    return keyAsset.dataObject;
  } catch (error: any) {
    return new Error(error);
  }
};
