import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// components
import Admin from "@/components/Admin";
import Board from "@/components/Board";
import Loading from "@/components/Loading";

// context
import { GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI } from "@/utils/backendAPI";
import { AdminIconButton } from "@/components";

function Home() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { hasSetupBackend } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasSetupBackend) {
      backendAPI
        .get("/visitor")
        .then((result) => {
          setIsAdmin(result.data.visitor.isAdmin);
        })
        .catch(() => navigate("*"))
        .finally(() => setIsLoading(false));
    }
  }, [hasSetupBackend]);

  if (isLoading || !hasSetupBackend) return <Loading />;

  return (
    <div className="container p-6 items-center justify-start">
      {isAdmin && (
        <AdminIconButton setShowSettings={() => setShowSettings(!showSettings)} showSettings={showSettings} />
      )}
      {showSettings ? <Admin /> : <Board />}
    </div>
  );
}

export default Home;
