import { useContext, useEffect, useState } from "react";

// components
import { Accordion, AdminForm, ListItem } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI } from "@/utils/backendAPI";

// types
import { AdminFormValues, MessageI, MessagesType } from "@/types";
import { ErrorType, SET_THEME } from "@/context/types";
import { setErrorMessage } from "@/utils";

export const Admin = () => {
  const { theme } = useContext(GlobalStateContext);
  const dispatch = useContext(GlobalDispatchContext);

  const [currentTheme, setTheme] = useState(theme);
  const [messages, setMessages] = useState<{ [key: string]: MessageI }>({});
  const [messagesLength, setMessagesLength] = useState(0);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  useEffect(() => {
    getMessages();
  }, []);

  const getMessages = () => {
    backendAPI
      .get(`/admin/messages`)
      .then((result) => updateState(result.data))
      .catch((error) => setErrorMessage(dispatch, error as ErrorType));
  };

  const updateState = (data: MessagesType) => {
    setMessages(data);
    setMessagesLength(Object.keys(data).length || 0);
    setErrorMessage(dispatch, "");
  };

  const handleOnSubmit = (data: AdminFormValues) => {
    setAreButtonsDisabled(true);
    backendAPI
      .post("/admin/theme", { ...data, existingThemeId: theme!.id })
      .then((response) => {
        dispatch!({
          type: SET_THEME,
          payload: { theme: response.data.theme },
        });
        setTheme(response.data.theme);
      })
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

  const approveMessage = (messageId: string) => {
    setAreButtonsDisabled(true);
    backendAPI
      .post(`/admin/message/approve/${messageId}`)
      .then((result) => updateState(result.data))
      .catch(async (error) => {
        setErrorMessage(dispatch, error as ErrorType);
        await getMessages();
      })
      .finally(() => setAreButtonsDisabled(false));
  };

  const deleteMessage = (messageId: string) => {
    setAreButtonsDisabled(true);
    backendAPI
      .delete(`/admin/message/${messageId}`)
      .then((result) => updateState(result.data))
      .catch(async (error) => {
        setErrorMessage(dispatch, error as ErrorType);
        await getMessages();
      })
      .finally(() => setAreButtonsDisabled(false));
  };

  const handleResetScene = async (shouldHardReset: boolean) => {
    setAreButtonsDisabled(true);
    backendAPI
      .post("/admin/reset", { shouldHardReset })
      .then((result) => updateState(result.data))
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => setAreButtonsDisabled(false));
  };

  const handleRemoveScene = async () => {
    setAreButtonsDisabled(true);
    backendAPI
      .post("/admin/remove")
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => setAreButtonsDisabled(false));
  };

  const getMessagesList = () => {
    return (
      <div>
        {Object.values(messages).map((item, index) => (
          <ListItem
            key={item.id}
            id={item.id}
            displayName={item.displayName}
            hasDivider={index < messagesLength - 1}
            imageUrl={item.imageUrl}
            areButtonsDisabled={areButtonsDisabled}
            message={item.message}
            onApprove={approveMessage}
            onDelete={deleteMessage}
            username={item.username}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col pb-6">
        <h1 className="h3">Admin</h1>
        <p className="p1 pt-4">
          This is the admin panel. You can approve messages, update the theme/scene, or clear all submissions.
        </p>
      </div>
      <Accordion title="Settings">
        <AdminForm
          handleSubmitForm={handleOnSubmit}
          handleResetScene={handleResetScene}
          handleRemoveScene={handleRemoveScene}
          isLoading={areButtonsDisabled}
          theme={currentTheme!}
        />
      </Accordion>
      {messages && messagesLength > 0 && (
        <div className="mt-4">
          <Accordion title="Pending Approval">{getMessagesList()}</Accordion>
        </div>
      )}
    </>
  );
};

export default Admin;
