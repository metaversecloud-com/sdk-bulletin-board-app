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
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    backendAPI.get(`/messages/pending`).then((result) => {
      setMessages(result.data)
      setMessagesLength(Object.keys(result.data).length)
    }).catch((error) => console.log(error)).finally(() => setIsLoading(false))
  }, [])

  const handleOnSubmit = (data: any) => {
    console.log("🚀 ~ file: Admin.tsx:35 ~ data:", data)
    setIsUpdating(true)
    setTheme(data)
    backendAPI.post("/theme", data).then(() => {
      console.log("🚀 ~ file: Admin.tsx:43 ~ data:", data)
      dispatch!({
        type: SET_THEME,
        payload: { ...data },
      });
      setTheme(data)
    }).catch((error) => console.log(error)).finally(() => { setIsUpdating(false) })
  };

  const approveMessage = (messageId: string) => {
    setIsUpdating(true)
    backendAPI.post(`/message/approve/${messageId}`).then((result) => {
      console.log("🚀 ~ file: Admin.tsx:52 ~ result.data:", result.data)
      setMessages(result.data)
      setMessagesLength(Object.keys(result.data).length)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  const rejectMessage = (messageId: string) => {
    setIsUpdating(true)
    backendAPI.post(`/message/reject/${messageId}`).then((result) => {
      setMessages(result.data)
      setMessagesLength(Object.keys(result.data).length)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  const deleteMessage = (messageId: string) => {
    setIsUpdating(true)
    backendAPI.delete(`/message/${messageId}`).then((result) => {
      setMessages(result.data)
      setMessagesLength(Object.keys(result.data).length)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  if (isLoading || !hasSetupBackend) return <Loading />;

  const getMessagesList = () => {
    return (
      <div>
        {Object.values(messages).map((item, index) => (
          <ListItem
            id={item.id}
            hasDivider={index < messagesLength - 1}
            isUpdating={isUpdating}
            message={item.message}
            onApprove={approveMessage}
            onDeny={rejectMessage}
            onDelete={theme.id === "CHALK" && deleteMessage}
            username={item.userName}
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
        <AdminForm handleSubmitForm={handleOnSubmit} isLoading={isUpdating} theme={currentTheme} />
      </Accordion>
      {messages && messagesLength > 0 &&
        <div className="mt-4">
          <Accordion title="Pending Approval">
            {getMessagesList()}
          </Accordion>
        </div>
      }
    </>
  );
}

export default Admin;

