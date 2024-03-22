import { DroppedAsset } from "./topiaInit";
import { Credentials } from "../types";

export const writeDataObjectToDroppedAssetId = async (
  credentials: Credentials,
  dataObject: any = {}
) => {
  const writeObject = await DroppedAsset.create(
    credentials.assetId,
    credentials.urlSlug,
    {
      credentials,
    }
  );

  await writeObject.updateDataObject({ dataObject });
};