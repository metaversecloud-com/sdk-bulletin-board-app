import { useContext, useState, useEffect } from 'react';

// components
import List from "@/components/List/List";
import Loading from "@/components/Loading";
import Form from "@/components/Form";

// context
import { GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI } from "@/utils/backendAPI";

function Board() {
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { hasSetupBackend, theme } = useContext(GlobalStateContext);

  useEffect(() => {
    backendAPI.get("/user/pending").then((result) => {
      console.log("🚀 ~ file: Board.tsx:25 ~ result.data:", result.data.messages)
      setMessages(result.data.messages)
    }).catch((error) => console.log(error)).finally(() => setIsLoading(false))
  }, [])

  const addMessage = (message: string) => {
    setIsUpdating(true)
    backendAPI.post("/user/message", { message }).then((result) => {
      setMessages(result.data.messages)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  const removeMessage = (id: string) => {
    setIsUpdating(true)
    backendAPI.delete(`/user/message/${id}`).then((result) => {
      setMessages(result.data.messages)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  if (isLoading || !hasSetupBackend || !theme.title) return <Loading />;

  console.log("🚀 ~ file: Board.tsx:72 ~ Object.keys(messages).length:", Object.keys(messages).length)

  return (
    <>
      <div className="flex flex-col pb-6">
        <h1 className="h3">{theme.title}</h1>
        <h4 className="h4 pb-4 pt-4">{theme.subtitle}</h4>
        <p className="p1">{theme.paragraph}</p>
      </div>
      {messages && Object.keys(messages).length > 0 &&
        <List
          listItems={messages}
          title="Messages pending approval"
          isUpdating={isUpdating}
          onRemove={removeMessage}
        />
      }
      <div className="flex flex-col mb-6 mt-6">
        {Object.keys(messages).length < 3 ? (
          <Form handleSubmitForm={addMessage} isLoading={isUpdating} />
        ) : (
          <p>
            You have reached the limit of maximum messages you can submit for
            approval. You can either wait for your messages to be screened, or
            delete a submission.
          </p>
        )}
      </div>
    </>
  );
}

export default Board;
