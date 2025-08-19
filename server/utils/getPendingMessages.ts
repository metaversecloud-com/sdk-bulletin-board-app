import { IDroppedAsset, MessageType } from "../types.js";
import { errorHandler } from "./index.js";

export const getPendingMessages = async ({
  messages,
  profileId,
  keyAsset,
}: {
  messages?: object;
  profileId?: string;
  keyAsset?: IDroppedAsset;
}) => {
  try {
    // pass world if data object should be refetched
    if (keyAsset) {
      await keyAsset.fetchDataObject();
      messages = keyAsset.dataObject.messages;
    }

    if (!messages) return {};

    // pass profileId if messages should be filtered by current user
    const pendingMessages = Object.entries(messages).reduce(
      (pendingMessages: { [key: string]: MessageType }, [key, message]) => {
        if ((!profileId || message.userId === profileId) && message.approved === false) pendingMessages[key] = message;
        return pendingMessages;
      },
      {},
    );

    return pendingMessages;
  } catch (error: any) {
    return new Error(error);
  }
};
