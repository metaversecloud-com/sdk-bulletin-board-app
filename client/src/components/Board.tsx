import { useContext, useState, useEffect } from "react";

// components
import { Accordion, ListItem, MessageForm } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

// types
import { MessageI } from "@/types";
import { ErrorType } from "@/context/types";

export const Board = () => {
  const [messages, setMessages] = useState<{ [key: string]: MessageI }>({});
  const [messagesLength, setMessagesLength] = useState(0);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { theme } = useContext(GlobalStateContext);
  const { id, title, subtitle, description } = theme || { id: "CHALK" };

  useEffect(() => {
    backendAPI
      .get("/messages")
      .then((result) => {
        setMessages(result.data);
        setMessagesLength(Object.keys(result.data).length);
      })
      .catch((error) => setErrorMessage(dispatch, error as ErrorType));
  }, []);

  const addMessage = async (data: { imageData?: string; message?: string }) => {
    setAreButtonsDisabled(true);
    backendAPI
      .post("/message", data)
      .then((result) => {
        setMessages(result.data);
        setMessagesLength(Object.keys(result.data).length);
      })
      .catch(() =>
        setErrorMessage(
          dispatch,
          "An error has occurred while trying to submit your message for approval. Please try again later." as ErrorType,
        ),
      )
      .finally(() => setAreButtonsDisabled(false));
  };

  const removeMessage = (messageId: string) => {
    setAreButtonsDisabled(true);
    backendAPI
      .delete(`/message/${messageId}`)
      .then((result) => {
        setMessages(result.data);
        setMessagesLength(Object.keys(result.data).length);
      })
      .catch((error) => setErrorMessage(dispatch, error as ErrorType))
      .finally(() => setAreButtonsDisabled(false));
  };

  const getMessagesList = (): React.ReactNode[] => {
    return Object.values(messages).map((item, index) => (
      <ListItem
        key={item.id}
        id={item.id}
        hasDivider={index < messagesLength - 1}
        imageUrl={item.imageUrl}
        areButtonsDisabled={areButtonsDisabled}
        message={item.message}
        onDelete={removeMessage}
      />
    ));
  };

  return (
    <>
      <div className="flex flex-col">
        <h1 className="h3">{title}</h1>
        <h4 className="h4 py-4">{subtitle}</h4>
        <p className="p1">{description}</p>
      </div>
      <div className="flex flex-col mb-8 mt-10">
        {messagesLength < 3 ? (
          <MessageForm handleSubmitForm={addMessage} isLoading={areButtonsDisabled} themeId={id} />
        ) : (
          <p>
            You have reached the limit of maximum messages you can submit for approval. You can either wait for your
            messages to be screened, or delete a submission.
          </p>
        )}
      </div>
      {messages && messagesLength > 0 && <Accordion title="Pending Approval">{getMessagesList()}</Accordion>}
    </>
  );
};

export default Board;
