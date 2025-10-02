import { DroppedAsset, initializeDataObject } from "./index.js";
import { Credentials, IDroppedAsset } from "../types.js";

export const getKeyAssetDataObject = async (
  credentials: Credentials,
): Promise<{ dataObject: any; keyAsset: IDroppedAsset } | Error> => {
  try {
    const { assetId, urlSlug } = credentials;

    const keyAsset = (await DroppedAsset.create(assetId, urlSlug, { credentials })) as IDroppedAsset;

    const initResult = await initializeDataObject({ credentials, keyAsset });
    if (initResult instanceof Error) throw initResult;

    return { dataObject: initResult, keyAsset };
  } catch (error: any) {
    return new Error(error);
  }
};
