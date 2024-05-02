import { deleteFromS3, errorHandler } from "./index.js";
import { Credentials, MessagesType } from "../types.js";

export const deleteMessage = async ({
  credentials,
  messageId,
  messages,
  world,
}: {
  credentials: Credentials;
  messageId: string;
  messages: MessagesType;
  world: any;
}) => {
  try {
    const { sceneDropId } = credentials;

    const message = messages[messageId];
    if (!message) throw new Error("Message not found");

    if (message.imageUrl) {
      const { success } = await deleteFromS3(message.id);
      if (!success) throw "Error deleting image.";
    }

    delete messages[messageId];

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await world.updateDataObject(
      {
        [`scenes.${sceneDropId}.messages`]: messages,
      },
      { lock: { lockId, releaseLock: true } },
    );

    return { success: true };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "deleteMessage",
      message: "Error deleting message.",
    });
  }
};
