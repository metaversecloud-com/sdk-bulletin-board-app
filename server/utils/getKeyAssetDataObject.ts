import { DroppedAsset, initializeDataObject, standardizeError } from "./index.js";
import { Credentials, IDroppedAsset } from "../types.js";

export const getKeyAssetDataObject = async (
  credentials: Credentials,
): Promise<{ dataObject: any; keyAsset: IDroppedAsset }> => {
  try {
    const { assetId, urlSlug } = credentials;

    const keyAsset = (await DroppedAsset.create(assetId, urlSlug, { credentials })) as IDroppedAsset;

    const dataObject = await initializeDataObject({ credentials, keyAsset });

    return { dataObject, keyAsset };
  } catch (error) {
    throw standardizeError(error);
  }
};
