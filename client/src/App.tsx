import { useContext, useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

// pages
import Home from "./pages/Home";
import Error from "./pages/Error";
import Loading from "./components/Loading";

// context
import { GlobalDispatchContext } from "./context/GlobalContext";
import { InteractiveParams, SET_HAS_INTERACTIVE_PARAMS } from "./context/types";

// utils
import { setupBackendAPI } from "@/utils";

import "./index.css";

const App = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);

  const interactiveParams: InteractiveParams = useMemo(() => {
    return {
      assetId: searchParams.get("assetId") || "",
      displayName: searchParams.get("displayName") || "",
      identityId: searchParams.get("identityId") || "",
      interactiveNonce: searchParams.get("interactiveNonce") || "",
      interactivePublicKey: searchParams.get("interactivePublicKey") || "",
      profileId: searchParams.get("profileId") || "",
      sceneDropId: searchParams.get("sceneDropId") || "",
      uniqueName: searchParams.get("uniqueName") || "",
      urlSlug: searchParams.get("urlSlug") || "",
      username: searchParams.get("username") || "",
      visitorId: searchParams.get("visitorId") || "",
    };
  }, [searchParams]);

  useEffect(() => {
    if (interactiveParams.assetId) {
      dispatch!({
        type: SET_HAS_INTERACTIVE_PARAMS,
        payload: { hasInteractiveParams: true },
      });
    }
  }, [interactiveParams]);

  useEffect(() => {
    if (!hasInitBackendAPI) setupBackend();
  }, [hasInitBackendAPI, interactiveParams]);

  const setupBackend = () => {
    setupBackendAPI(interactiveParams)
      .catch((error) => {
        console.error(error?.response?.data?.message);
        navigate("*");
      })
      .finally(() => setHasInitBackendAPI(true));
  };

  if (!hasInitBackendAPI) return <Loading />;

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
};

export default App;
