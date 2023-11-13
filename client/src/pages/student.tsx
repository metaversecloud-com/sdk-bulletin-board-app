import List from "../components/List";
import InputForm from "../components/InputForm";
import axios from "axios";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { AdminPanelSettings } from "@mui/icons-material";

const getMyMessages = async () => {
  const { data } = await axios.get(
    `/backend/user/pending${window.location.search}`
  );
  return data;
};

function StudentPage() {
  const { data, isLoading, error } = useQuery("messages", getMyMessages);
  const queryClient = useQueryClient();

  const addMessage = useMutation({
    mutationFn: (message) =>
      axios.post(`/backend/user/message${window.location.search}`, message),
    onSuccess: () => {
      queryClient.invalidateQueries("messages");
    },
  });

  const removeMessage = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`/backend/user/message/${id}${window.location.search}`),
    onSuccess: () => {
      queryClient.invalidateQueries("messages");
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Something went wrong. Please try closing the window and clicking on the
        asset again.
      </div>
    );
  console.log(data);
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "96vh",
          width: "320px",
        }}
      >
        {data.isAdmin && (
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <Link to={`/admin${window.location.search}`}>
              <button>
                <AdminPanelSettings /> Admin
              </button>
            </Link>
          </div>
        )}
        <div style={{ margin: "0 12px", marginBottom: "48px" }}>
          <h1>Gratitude Garden</h1>
          <h3>What are you thankful for today?</h3>
          <p>
            Enter below and once it’s reviewed and approved it will be added to
            the Gratitude Garden. You can submit 3 at a time for approval.
          </p>
        </div>

        <div>
          <List
            listItems={data.messages}
            title="Messages pending approval"
            editable={true}
            onRemove={removeMessage}
          />
        </div>
        <div style={{ marginTop: "auto" }}>
          {data.messages.length < 3 ? (
            <div>
              <InputForm
                formSubmit={addMessage}
                isLoading={addMessage.isLoading}
              />
            </div>
          ) : (
            <p>
              You have reached the limit of maximimum messages you can submit
              for approval. You can either wait for your messages to be
              screened, or delete a submision.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default StudentPage;
