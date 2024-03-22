import { useContext, useEffect, useState } from "react";

// components
import List from "../components/List/List";
import Loading from "@/components/Loading";

// context
import { GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI } from "@/utils/backendAPI";

function Admin() {
  const { hasSetupBackend } = useContext(GlobalStateContext);

  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    backendAPI.get(`/admin/pending`).then((result) => {
      setMessages(result.data.messages)
    }).catch((error) => console.log(error)).finally(() => setIsLoading(false))
  }, [])

  const approveMessage = (id: string) => {
    setIsUpdating(true)
    backendAPI.post(`/admin/message/approve/${id}`).then((result) => {
      setMessages(result.data.messages)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  const rejectMessage = (id: string) => {
    setIsUpdating(true)
    backendAPI.delete(`/admin/message/reject/${id}`).then((result) => {
      setMessages(result.data.messages)
    }).catch((error) => console.log(error)).finally(() => setIsUpdating(false))
  };

  if (isLoading || !hasSetupBackend) return <Loading />;

  return (
    <>
      <div className="flex flex-col pb-6">
        <h1 className="h3">Admin</h1>
        <p className="p1">This is the admin panel. You can approve messages here.</p>
      </div>
      {Object.keys(messages).length > 0 &&
        <List
          listItems={messages}
          title="Pending Approval"
          isUpdating={isUpdating}
          onApprove={approveMessage}
          onRemove={rejectMessage}
        />
      }
    </>
  );
}

export default Admin;
