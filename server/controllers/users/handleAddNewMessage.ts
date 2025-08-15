import { Request, Response } from "express";
import { errorHandler, getCredentials, getPendingMessages, uploadToS3 } from "../../utils/index.js";
import { getKeyAssetDataObject } from "../../utils/index.js";
import { DataObjectType, MessageType } from "../../types.js";

export const handleAddNewMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { displayName, profileId, urlSlug, username } = credentials;
    const { imageData, message } = req.body;

    const getKeyAssetResult = await getKeyAssetDataObject(credentials);
    if (getKeyAssetResult instanceof Error) throw getKeyAssetResult;

    const { dataObject, keyAsset } = getKeyAssetResult;
    const { theme } = dataObject as DataObjectType;

    const id = `${profileId}-${Date.now()}`;
    const newMessage: MessageType = {
      id,
      message,
      userId: profileId,
      displayName,
      username,
      approved: false,
    };

    if (imageData) {
      const uploadResult = await uploadToS3(imageData, id);
      if (uploadResult instanceof Error) throw uploadResult;

      newMessage.imageUrl = uploadResult.imageUrl;
    }

    await keyAsset.updateDataObject(
      {
        [`messages.${newMessage.id}`]: newMessage,
      },
      {
        analytics: [
          { analyticName: `newMessages`, profileId, urlSlug, uniqueKey: profileId },
          { analyticName: `${theme.id}-newMessages`, profileId, urlSlug, uniqueKey: profileId },
        ],
      },
    );

    return res.json(await getPendingMessages({ profileId, keyAsset }));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleAddNewMessage",
      message: "Error adding new message.",
      req,
      res,
    });
  }
};
