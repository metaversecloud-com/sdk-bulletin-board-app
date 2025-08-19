import { Request, Response } from "express";
import { errorHandler, getCredentials, getKeyAssetDataObject, removeSceneFromWorld } from "../../utils/index.js";

export const handleUpdateTheme = async (req: Request, res: Response) => {
  let message = "Error updating theme.";
  try {
    const credentials = getCredentials(req.query);
    const { assetId } = credentials;
    const theme = req.body;
    const { existingThemeId, id } = theme;

    if (existingThemeId && existingThemeId !== id) {
      const removeSceneResult = await removeSceneFromWorld({ credentials, theme });
      if (removeSceneResult instanceof Error) {
        message = removeSceneResult.message;
        throw removeSceneResult;
      }
    } else {
      const getKeyAssetResult = await getKeyAssetDataObject(credentials);
      if (getKeyAssetResult instanceof Error) throw getKeyAssetResult;

      const { keyAsset } = getKeyAssetResult;

      const lockId = `${assetId}-settings-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
      await keyAsset.updateDataObject({ theme }, { lock: { lockId, releaseLock: true } });
    }

    return res.send({ theme });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleUpdateTheme",
      message,
      req,
      res,
    });
  }
};
