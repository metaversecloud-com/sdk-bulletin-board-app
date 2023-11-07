import { Routes, Route } from "react-router-dom";
import StudentPage from "./pages/student";
import AdminPage from "./pages/admin";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<StudentPage />} />
        <Route path="/admin" element={<AdminPage/>} />
      </Routes>
    </div>
  );
}

export default App;
