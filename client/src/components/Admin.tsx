import { useContext, useEffect, useState } from "react";

// components
import Accordion from "@/components/Accordion";
import AdminForm from "@/components/AdminForm";
import ListItem from "./ListItem";
import Loading from "@/components/Loading";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { SET_THEME } from "@/context/types";

// utils
import { backendAPI } from "@/utils/backendAPI";

// types
import { AdminFormValues, MessageI, MessagesType } from "@/types";

function Admin() {
  const { hasSetupBackend, theme } = useContext(GlobalStateContext);
  const dispatch = useContext(GlobalDispatchContext);

  const [currentTheme, setTheme] = useState(theme);
  const [messages, setMessages] = useState<{ [key: string]: MessageI }>({});
  const [messagesLength, setMessagesLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    backendAPI
      .get(`/admin/messages`)
      .then((result) => {
        setMessages(result.data);
        setMessagesLength(Object.keys(result.data).length);
      })
      .catch((error) => setErrorMessage(error))
      .finally(() => setIsLoading(false));
  }, []);

  const updateState = (data: MessagesType) => {
    setMessages(data);
    setMessagesLength(Object.keys(data).length || 0);
  };

  const handleOnSubmit = (data: AdminFormValues) => {
    setAreButtonsDisabled(true);
    setErrorMessage("");
    backendAPI
      .post("/admin/theme", { ...data, existingThemeId: theme.id })
      .then(() => {
        dispatch!({
          type: SET_THEME,
          payload: { ...data },
        });
        setTheme(data);
      })
      .catch((error) => setErrorMessage(error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

  const approveMessage = (messageId: string) => {
    setAreButtonsDisabled(true);
    setErrorMessage("");
    backendAPI
      .post(`/admin/message/approve/${messageId}`)
      .then((result) => updateState(result.data))
      .catch((error) => setErrorMessage(error))
      .finally(() => setAreButtonsDisabled(false));
  };

  const deleteMessage = (messageId: string) => {
    setAreButtonsDisabled(true);
    setErrorMessage("");
    backendAPI
      .delete(`/admin/message/${messageId}`)
      .then((result) => updateState(result.data))
      .catch((error) => setErrorMessage(error))
      .finally(() => setAreButtonsDisabled(false));
  };

  const handleResetScene = async (shouldHardReset: boolean) => {
    setAreButtonsDisabled(true);
    setErrorMessage("");
    backendAPI
      .post("/admin/reset", { shouldHardReset })
      .then((result) => updateState(result.data))
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setAreButtonsDisabled(false));
  };

  if (isLoading || !hasSetupBackend) return <Loading />;

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
        <p className="p1 pt-4">This is the admin panel. You can approve messages here.</p>
      </div>
      <Accordion title="Settings">
        <AdminForm
          handleSubmitForm={handleOnSubmit}
          handleResetScene={handleResetScene}
          isLoading={areButtonsDisabled}
          theme={currentTheme}
        />
      </Accordion>
      {messages && messagesLength > 0 && (
        <div className="mt-4">
          <Accordion title="Pending Approval">{getMessagesList()}</Accordion>
        </div>
      )}
      {errorMessage && <p className="p3 text-error">{`${errorMessage}`}</p>}
    </>
  );
}

export default Admin;
