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
import { MessageI } from "@/types";

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
    backendAPI.get(`/messages/pending`)
      .then((result) => {
        setMessages(result.data)
        setMessagesLength(Object.keys(result.data).length)
      })
      .catch((error) => setErrorMessage(error))
      .finally(() => setIsLoading(false))
  }, [])

  const handleOnSubmit = (data: any) => {
    setAreButtonsDisabled(true)
    setTheme(data)
    backendAPI.post("/theme", data)
      .then(() => {
        dispatch!({
          type: SET_THEME,
          payload: { ...data },
        });
        setTheme(data)
      })
      .catch((error) => setErrorMessage(error))
      .finally(() => { setAreButtonsDisabled(false) })
  };

  const approveMessage = (messageId: string) => {
    setAreButtonsDisabled(true)
    setErrorMessage("")
    backendAPI.post(`/message/approve/${messageId}`)
      .then((result) => {
        setMessages(result.data)
        setMessagesLength(Object.keys(result.data).length)
      })
      .catch((error) => setErrorMessage(error))
      .finally(() => setAreButtonsDisabled(false))
  };

  const deleteMessage = (messageId: string) => {
    setAreButtonsDisabled(true)
    setErrorMessage("")
    backendAPI.delete(`/message/${messageId}`)
      .then((result) => {
        setMessages(result.data)
        setMessagesLength(Object.keys(result.data).length)
      })
      .catch((error) => setErrorMessage(error))
      .finally(() => setAreButtonsDisabled(false))
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
        <p className="p1">This is the admin panel. You can approve messages here.</p>
      </div>
      <Accordion title="Settings">
        <AdminForm handleSubmitForm={handleOnSubmit} isLoading={areButtonsDisabled} theme={currentTheme} />
      </Accordion>
      {messages && messagesLength > 0 &&
        <div className="mt-4">
          <Accordion title="Pending Approval">
            {getMessagesList()}
          </Accordion>
        </div>
      }
      {errorMessage &&
        <p className="p3 text-error">{`${errorMessage}`}</p>
      }
    </>
  );
}

export default Admin;

