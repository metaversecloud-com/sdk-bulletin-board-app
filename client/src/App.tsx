import { Routes, Route } from "react-router-dom";
import StudentPage from "./pages/student";
import AdminPage from "./pages/admin";

import "./App.css";
import { useQuery } from "react-query";
import axios from "axios";

const getTheme = async () => {
  const { data } = await axios.get(`/backend/theme${window.location.search}`);
  return data;
};

function App() {
  const { data, isLoading, error } = useQuery("theme", getTheme);

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Something went wrong. Please try closing the window and clicking on the
        asset again.
      </div>
    );

  const themeColor = data.theme?.backgroundColor || "white";

  return (
    <div className="app" style={{ background: themeColor }}>
      <Routes>
        <Route path="/" element={<StudentPage theme={data.theme} />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;
