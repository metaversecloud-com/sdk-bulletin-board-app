import { deleteFromS3, standardizeError } from "./index.js";
import { Credentials, IDroppedAsset, MessagesType } from "../types.js";

export const deleteMessage = async ({
  credentials,
  keyAsset,
  messageId,
  messages,
}: {
  credentials: Credentials;
  keyAsset: IDroppedAsset;
  messageId: string;
  messages: MessagesType;
}): Promise<{ success: true }> => {
  try {
    const { assetId } = credentials;

    const message = messages[messageId];
    if (!message) throw new Error("Message not found");

    if (message.imageUrl) {
      await deleteFromS3(message.id);
    }

    delete messages[messageId];

    const lockId = `${assetId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    await keyAsset.updateDataObject({ messages }, { lock: { lockId, releaseLock: true } });

    return { success: true };
  } catch (error) {
    throw standardizeError(error);
  }
};
