import { Request, Response } from "express";
import { errorHandler, getCredentials, getPendingMessages, getWorldDataObject } from "../../utils/index.js";
import { DataObjectType } from "../../types.js";
import { deleteMessage } from "../../utils/deleteMessage.js";

export const handleDeleteMessage = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { sceneDropId } = credentials;
    const { messageId } = req.params;

    const { dataObject, world } = await getWorldDataObject(credentials);
    const { messages, theme } = dataObject as DataObjectType;

    await deleteMessage({ credentials, messageId, messages, world });

    world.updateDataObject(
      {},
      {
        analytics: [{ analyticName: `messageRejects` }, { analyticName: `${theme.id}-messageRejects` }],
      },
    );

    return res.json(await getPendingMessages({ sceneDropId, world }));
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleDeleteMessage",
      message: "Error deleting message.",
      req,
      res,
    });
  }
};
