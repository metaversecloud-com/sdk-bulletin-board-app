import { MessageType } from "../../types.js";
import { errorHandler } from "../index.js";

export const getPendingMessages = async ({
  messages,
  profileId,
  sceneDropId,
  world,
}: {
  messages?: object;
  profileId?: string;
  sceneDropId: string;
  world?: any;
}) => {
  try {
    // pass world if data object should be refetched
    if (world) {
      await world.fetchDataObject();
      messages = world.dataObject.scenes[sceneDropId].messages;
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
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getPendingMessages",
      message: "Error getting pending messages.",
    });
  }
};
