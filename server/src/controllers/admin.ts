import { Request, Response } from "express";
import {
  credentialsFromQuery,
  getDataObjectFromDroppedAsset,
  writeDataObjectToDroppedAssetId,
} from "../../utils/common.js";

import {
  DroppedAssetFactory,
  DroppedAssetInterface,
  WorldFactory
} from "@rtsdk/topia";
import myTopiaInstance from "../../utils/topiaInstance.js";

export const approveMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const credentials = credentialsFromQuery(req);

    const { dataObject } = await getDataObjectFromDroppedAsset(
      credentials.assetId,
      credentials
    );

    const { messages, usedSpaces = [], placedTextAssets = [] } = dataObject;
    const thisMessage = messages.find((m) => m.id === id);
    if (!thisMessage) {
      throw new Error("Message not found");
    }

    const world = new WorldFactory(myTopiaInstance).create(
      credentials.urlSlug,
      { credentials }
    );

    const assets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: "anchor",
    });

    // const droppedCounter = droppedCounter++ 
    // use lock key nearest 10th second for v2
    
    if (placedTextAssets.length !== assets.length) {
      const emptySpaces = assets.filter((s) => !usedSpaces.includes(s.id));
      const random = Math.floor(Math.random() * emptySpaces.length);
      const asset = emptySpaces[random] as any;
      const sceneIds = ["ObrCYwGpWMjtzRaqBTdw","hlXXIoZi3XvnfXuar8bA","n7E1VtIWl1oEMKbrSdbA"]

      const randomScene = Math.floor(Math.random() * sceneIds.length);

      const sc = (await world.dropScene({
        sceneId: sceneIds[randomScene],
        position: asset.position,
        assetSuffix: "message",
      })) as any;

      const assetsList = (await world.fetchDroppedAssetsBySceneDropId({
        sceneDropId: sc.data.sceneDropId,
      })) as DroppedAssetInterface[];

      const justDroppedTextAsset = assetsList.find(
        (a) => a.assetId === "textAsset"
      );

      const mutatableAsset = await new DroppedAssetFactory(myTopiaInstance).create(
        justDroppedTextAsset.id,
        credentials.urlSlug
      );
      
      await mutatableAsset.updateCustomTextAsset({}, thisMessage.message);

      const newUsedSpaces = [...usedSpaces, asset.id];
      const newPlacedTextAssets = [
        ...placedTextAssets,
        justDroppedTextAsset.id,
      ];

      const updatedMessages = messages.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            approved: true,
          };
        }
        return m;
      });

      const updatedData = {
        ...dataObject,
        messages: updatedMessages,
        usedSpaces: newUsedSpaces,
        placedTextAssets: newPlacedTextAssets,
      };

      await writeDataObjectToDroppedAssetId(
        credentials,
        credentials.assetId,
        updatedData
      );
    } else {
      const random = Math.floor(Math.random() * placedTextAssets.length);
      const assetId = placedTextAssets[random];
      const mutatableAsset = await new DroppedAssetFactory(myTopiaInstance).create(
        assetId,
        credentials.urlSlug
      );
      await mutatableAsset.updateCustomTextAsset({}, thisMessage.message);
      const updatedMessages = messages.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            approved: true,
          };
        }
        return m;
      });
      const updatedData = {
        ...dataObject,
        messages: updatedMessages,
      };

      await writeDataObjectToDroppedAssetId(
        credentials,
        credentials.assetId,
        updatedData
      );
    }
    return res.send(assets);
  } catch (error) {
    console.log(error);
    res.status(503).send("Error approving messages");
  }
};

export const rejectMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const credentials = credentialsFromQuery(req);

    const { dataObject } = await getDataObjectFromDroppedAsset(
      credentials.assetId,
      credentials
    );

    const updatedMessages = dataObject.messages.filter((message: any) => message.id !== id);

    const updatedData = {
      ...dataObject,
      messages: updatedMessages,
    };

    await writeDataObjectToDroppedAssetId(
      credentials,
      credentials.assetId,
      updatedData
    );

    return res.send(updatedData);
  } catch (error) {
    console.log(error);
    res.status(503).send("Error rejecting messages");
  }
};

export const getPendingMessages = async (req: Request, res: Response) => {
  try {
    const credentials = credentialsFromQuery(req);
    const { dataObject } = await getDataObjectFromDroppedAsset(
      credentials.assetId,
      credentials
    );

    if (dataObject?.messages === undefined) return res.send([]);

    const pendingMEssages = dataObject.messages.filter(
      (message: any) => message.approved === false
    );

    res.json(pendingMEssages);
  } catch (error) {
    console.error("getPendingMessages", JSON.stringify(error));
    res.status(503).send("Error getting messages");
  }
};
