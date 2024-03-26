import { errorHandler } from "../utils";

export const getPendingMessages = async (messages: object) => {
  try {
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
