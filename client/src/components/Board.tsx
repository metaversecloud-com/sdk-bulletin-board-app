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
import { MessageI } from '@/types';

function Board() {
  const { hasSetupBackend, theme } = useContext(GlobalStateContext);

  const [messages, setMessages] = useState<{ [key: string]: MessageI }>({});
  const [messagesLength, setMessagesLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);


  useEffect(() => {
    backendAPI.get("/messages/pending").then((result) => {
      setMessages(result.data)
      setMessagesLength(Object.keys(result.data).length)
    }).catch((error) => console.log(error)).finally(() => setIsLoading(false))
  }, [])

  const addMessage = async (data: any) => {
    setIsUpdating(true)
    let imageUrl
    if (data.images) {
      const file = URL.createObjectURL(data.images[0]);
      imageUrl = file;
      console.log("🚀 ~ file: Board.tsx:43 ~ imageUrl:", imageUrl)
    }
    const payload = { image: imageUrl, message: data.message }
    console.log("🚀 ~ file: Board.tsx:37 ~ payload:", JSON.stringify(payload))
    backendAPI.post("/message", payload).then((result) => {
      setMessages(result.data)
      setMessagesLength(Object.keys(result.data).length)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  const removeMessage = (messageId: string) => {
    setIsUpdating(true)
    backendAPI.delete(`/message/${messageId}`).then((result) => {
      console.log("🚀 ~ file: Board.tsx:54 ~ result.data:", result.data)
      setMessages(result.data)
      setMessagesLength(Object.keys(result.data).length)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  if (isLoading || !hasSetupBackend || !theme.id) return <Loading />;

  const getMessagesList = () => {
    return (
      Object.values(messages).map((item, index) => (
        <ListItem
          id={item.id}
          hasDivider={index < messagesLength - 1}
          imageUrl={item.imageUrl}
          isUpdating={isUpdating}
          message={item.message}
          onDelete={removeMessage}
          username={item.userName}
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
          <MessageForm handleSubmitForm={addMessage} isLoading={isUpdating} themeId={theme.id} />
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
    </>
  );
}

export default Board;
