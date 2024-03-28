import { errorHandler } from "../utils/index.js";

export const getPendingMessages = async ({ messages, sceneDropId, world }: { messages?: object, sceneDropId?: string, world?: any }) => {
  try {
    if (world) {
      await world.fetchDataObject();
      messages = world.dataObject.scenes[sceneDropId].messages
    }

    if (!messages) return {}

    const pendingMessages = Object.entries(messages).reduce((approvedMessages, [key, message]) => {
      if (message.approved === false) {
        approvedMessages[key] = message;
      }
      return approvedMessages;
    }, {})

    return pendingMessages;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getPendingMessages",
      message: "Error getting pending messages.",
    });
  }
};
