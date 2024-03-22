import { errorHandler } from "./errorHandler";

export const initializeDroppedAssetDataObject = async (droppedAsset: any) => {
  try {
    await droppedAsset.fetchDataObject();

    const lockId = `${droppedAsset.id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!droppedAsset.dataObject?.theme?.id) {
      await droppedAsset.setDataObject(
        {
          messages: {},
          placedTextAssets: [],
          theme: {
            id: "GRATITUDE",
            title: "Gratitude Garden",
            subtitle: "Leave a message about something you're thankful for.",
            paragraph: "Enter a messages below and click Submit. Once it's approved it will be added to the garden.",
            color: ""
          },
          usedSpaces: [],
        },
        { lock: { lockId } },
      );
    }

    return;
  } catch (error) {
    errorHandler({
      error,
      functionName: "initializeDroppedAssetDataObject",
      message: "Error initializing dropped asset data object",
    });
    return await droppedAsset.fetchDataObject();
  }
};
