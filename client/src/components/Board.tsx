import { useContext, useState, useEffect } from 'react';

// components
import Accordion from "@/components/Accordion";
import ListItem from "@/components/ListItem";
import Loading from "@/components/Loading";
import MessageForm from "@/components/MessageForm";

// context
import { GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI } from "@/utils/backendAPI";

// types
import { MessageI } from '@/types';

function Board() {
  const { hasSetupBackend, theme } = useContext(GlobalStateContext);

  const [messages, setMessages] = useState<{ [key: string]: MessageI }>({});
  const [messagesLength, setMessagesLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    backendAPI.get("/messages/pending")
      .then((result) => {
        setMessages(result.data)
        setMessagesLength(Object.keys(result.data).length)
      })
      .catch((error) => setErrorMessage(error))
      .finally(() => setIsLoading(false))
  }, [])

  const addMessage = async (data: { imageData?: string, message?: string }) => {
    setAreButtonsDisabled(true)
    setErrorMessage("")
    backendAPI.post("/message", data)
      .then((result) => {
        setMessages(result.data)
        setMessagesLength(Object.keys(result.data).length)
      })
      .catch(() => setErrorMessage("An error has occurred while trying to submit your message for approval. Please try again later."))
      .finally(() => setAreButtonsDisabled(false))
  };

  const removeMessage = (messageId: string) => {
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

  const getMessagesList = (): React.ReactNode[] => {
    return (
      Object.values(messages).map((item, index) => (
        <ListItem
          key={item.id}
          id={item.id}
          hasDivider={index < messagesLength - 1}
          imageUrl={item.imageUrl}
          areButtonsDisabled={areButtonsDisabled}
          message={item.message}
          onDelete={removeMessage}
        />
      ))
    );
  };

  return (
    <>
      <div className="flex flex-col">
        <h1 className="h3">{theme.title}</h1>
        <h4 className="h4 pb-4 pt-4">{theme.subtitle}</h4>
        <p className="p1">{theme.description}</p>
      </div>
      <div className="flex flex-col mb-8 mt-10">
        {messagesLength < 3 ? (
          <MessageForm handleSubmitForm={addMessage} isLoading={areButtonsDisabled} setErrorMessage={setErrorMessage} themeId={theme.id} />
        ) : (
          <p>
            You have reached the limit of maximum messages you can submit for
            approval. You can either wait for your messages to be screened, or
            delete a submission.
          </p>
        )}
      </div>
      {messages && messagesLength > 0 &&
        <Accordion title="Pending Approval">
          {getMessagesList()}
        </Accordion>
      }
      {errorMessage &&
        <p className="p3 text-error">{`${errorMessage}`}</p>
      }
    </>
  );
}

export default Board;
