import { useMutation, useQuery, useQueryClient } from "react-query";
import List from "../components/List";
import axios from "axios";

const getPendingMessages = async () => {
  const { data } = await axios.get(
    `/backend/admin/pending${window.location.search}`
  );
  return data;
};

function AdminPage() {
  const queryClient = useQueryClient();

  const rejectMessage = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`/backend/admin/message/reject/${id}${window.location.search}`),
    onSuccess: () => {
      queryClient.invalidateQueries("pending-messages");
    },
  });

  const approveMessage = useMutation({
    mutationFn: (id: number) =>
      axios.post(`/backend/admin/message/approve/${id}${window.location.search}`),
    onSuccess: () => {
      queryClient.invalidateQueries("pending-messages");
    },
  });

  const { data, isLoading, error } = useQuery("pending-messages", getPendingMessages);

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Something went wrong. Please try closing the window and clicking on the
        asset again.
      </div>
    );

  return (
    <div>
      <h1>Admin</h1>
      <p>This is the admin panel. You can approve messages here.</p>
      <div>
        <List
          listItems={data}
          title="Pending Aproval"
          editable={true}
          onApprove={approveMessage}
          onRemove={rejectMessage}
        />
      </div>
    </div>
  );
}

export default AdminPage;
