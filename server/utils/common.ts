// common functions

import {
  DroppedAssetFactory,
  VisitorFactory,
  WorldFactory,
  InteractiveCredentials,
} from "@rtsdk/topia";
import { Credentials } from "./types";
import myTopiaInstance from "./topiaInstance.js";

// returns the credentials from the query
export const credentialsFromQuery = (req: any): Credentials => {
  const requiredFields = [
    "interactiveNonce",
    "interactivePublicKey",
    "urlSlug",
    "visitorId",
    "assetId",
  ];
  const { query } = req;
  const missingFields = requiredFields.filter((variable) => !query[variable]);
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required query parameters: ${missingFields.join(", ")}`
    );
  }

  return {
    interactiveNonce: query.interactiveNonce as string,
    interactivePublicKey: query.interactivePublicKey as string,
    urlSlug: query.urlSlug as string,
    visitorId: query.visitorId as number,
    assetId: query.assetId as string,
  };
};

export const extractImageURL = (url: string) => {
  return `https://${url.split("https%3A//")[1].split("?")[0]}`;
};

// GET DATA OBJECT FROM DROPPEDASSETID
export const getDataObjectFromDroppedAsset = async (
  droppedAssetId: string,
  credentials: Credentials,
  key?: string
) => {
  try {
    const asset = await new DroppedAssetFactory(myTopiaInstance).get(
      droppedAssetId,
      credentials.urlSlug,
      {
        credentials,
      }
    );

    const { dataObject } = asset;

    if (Object.keys(dataObject).length === 0) return {};

    if (!key) {
      return dataObject;
    }

    return dataObject[key];
  } catch (error) {
    console.error("getDataObjectFromDroppedAsset: error", error);
    return null;
  }
};

export const getProfile = async (credentials: InteractiveCredentials) => {
  try {
    const visitor = await new VisitorFactory(myTopiaInstance).get(
      credentials.visitorId,
      credentials.urlSlug,
      {
        credentials,
      }
    );
    
    const { isAdmin, profileId, username, displayName } = visitor as any;

    return { isAdmin, profileId, username, displayName };
  } catch (error) {
    console.error("getProfile: error", error);
    return {};
  }
};

// GET PROFILE INFOMRATION FROM VISITORID
export const getProfileInformationFromVisitorId = (visitorId: string) => {};

// WRITE DATA OBJECT TO DROPPEDASSETID
export const writeDataObjectToDroppedAssetId = async (
  credentials: Credentials,
  droppedAssetId: string,
  dataObject: any = {}
) => {
  const writeObject = await new DroppedAssetFactory(myTopiaInstance).create(
    credentials.assetId,
    credentials.urlSlug,
    {
      credentials,
    }
  );

  await writeObject.updateDataObject({ dataObject });
};