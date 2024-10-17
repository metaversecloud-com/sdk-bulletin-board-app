export const getErrorMessage = (
  error:
    | string
    | {
        message?: string;
        response?: { data?: { error?: { message?: string }; message?: string } };
      },
) => {
  if (typeof error === "string") return error;

  const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || error;
  return `Error: ${JSON.stringify(message)}`;
};
