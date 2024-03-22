import { DroppedAssetInterface } from "@rtsdk/topia";
import { Request, Response } from "express";
import {
  addHyphenAndNewline,
  DroppedAsset,
  errorHandler,
  getCredentials,
  getDroppedAssetDataObject,
  getThemeEnvVars,
  World,
} from "../utils";

export const handleApproveMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials

    const droppedAsset = await getDroppedAssetDataObject(assetId, credentials);

    const {
      messages,
      usedSpaces,
      placedTextAssets,
      theme,
    } = droppedAsset.dataObject;

    const thisMessage = messages[id];
    if (!thisMessage) throw new Error("Message not found");

    const world = await World.create(urlSlug, { credentials });

    const { anchors, droppableSceneIds } = getThemeEnvVars(theme.id)
    const anchorAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: anchors,
    });

    const emptySpaces = anchorAssets.filter((anchorAsset) => !usedSpaces.includes(anchorAsset.id));

    if (emptySpaces.length > 0) {
      const random = Math.floor(Math.random() * emptySpaces.length);
      const asset = emptySpaces[random] as any;
      usedSpaces.push[asset.id];

      if (!droppableSceneIds.length) throw new Error("No scenes found");
      const randomScene = Math.floor(Math.random() * droppableSceneIds.length);

      const sc = (await world.dropScene({
        sceneId: droppableSceneIds[randomScene],
        position: asset?.position,
        assetSuffix: "message",
      })) as any;

      const assetsList = (await world.fetchDroppedAssetsBySceneDropId({
        sceneDropId: sc.data.sceneDropId,
      })) as DroppedAssetInterface[];

      const justDroppedTextAsset = assetsList.find((a) => a.assetId === "textAsset");
      console.log("🚀 ~ file: handleApproveMessages.ts:60 ~ justDroppedTextAsset:", justDroppedTextAsset)
      placedTextAssets.push(justDroppedTextAsset)

      const textAsset = await DroppedAsset.create(
        justDroppedTextAsset.id,
        urlSlug
      );
      await textAsset.updateCustomTextAsset(
        {},
        addHyphenAndNewline(thisMessage.message)
      );

      await droppedAsset.updateDataObject({
        [`messages[${id}].approved`]: true,
        placedTextAssets,
        usedSpaces,
      });
    } else {
      // if all spaces are taken then update text for randomly selected already dropped text asset
      const random = Math.floor(Math.random() * placedTextAssets.length);
      const assetId = placedTextAssets[random];

      const textAsset = DroppedAsset.create(assetId, urlSlug);
      await textAsset.updateCustomTextAsset({}, thisMessage.message);

      await droppedAsset.updateDataObject({ [`messages[${id}].approved`]: true });
    }

    return res.send(await droppedAsset.fetchDataObject().messages);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleApproveMessages",
      message: "Error approving messages.",
      req,
      res,
    });
  }
};