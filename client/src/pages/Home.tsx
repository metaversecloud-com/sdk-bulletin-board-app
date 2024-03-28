import { useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

// components
import Admin from '@/components/Admin';
import Board from '@/components/Board';
import Loading from "@/components/Loading";

// context
import { GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI } from "@/utils/backendAPI";

function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("board");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { hasSetupBackend } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasSetupBackend) {
      backendAPI.get("/visitor")
        .then((result) => {
          setIsAdmin(result.data.visitor.isAdmin)
        })
        .catch(() => navigate("*"))
        .finally(() => setIsLoading(false));
    }
  }, [hasSetupBackend])

  if (isLoading || !hasSetupBackend) return <Loading />;

  return (
    <div className="container p-6 items-center justify-start">
      {isAdmin && (
        <div className="flex flex-col items-end mb-6">
          <div className="tab-container">
            <button className={activeTab === "board" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("board")}>
              Bulletin Board
            </button>
            <button className={activeTab === "admin" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("admin")}>
              Admin
            </button>
          </div>
        </div>
      )}
      {activeTab === "admin" ? (
        <Admin />
      ) : (
        <Board />
      )}
    </div>
  );
}

export default Home;
