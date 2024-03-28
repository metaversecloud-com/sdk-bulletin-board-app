import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

// pages
import Home from "./pages/Home";
import Error from "./pages/Error";
import Loading from "./components/Loading";

// context
import { GlobalDispatchContext } from "./context/GlobalContext";
import {
  InteractiveParams,
  SET_HAS_SETUP_BACKEND,
  SET_INTERACTIVE_PARAMS,
  SET_THEME,
} from "./context/types";

// utils
import { setupBackendAPI } from "./utils/backendAPI";
import { backendAPI } from "@/utils/backendAPI";

import "./index.css";

const App = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("white");

  const interactiveParams: InteractiveParams = useMemo(() => {
    return {
      assetId: searchParams.get("assetId") || "",
      displayName: searchParams.get("displayName") || "",
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

  const setInteractiveParams = useCallback(
    ({
      assetId,
      displayName,
      interactiveNonce,
      interactivePublicKey,
      profileId,
      sceneDropId,
      uniqueName,
      urlSlug,
      username,
      visitorId,
    }: InteractiveParams) => {
      const isInteractiveIframe =
        visitorId && interactiveNonce && interactivePublicKey && assetId;
      dispatch!({
        type: SET_INTERACTIVE_PARAMS,
        payload: {
          assetId,
          displayName,
          interactiveNonce,
          interactivePublicKey,
          isInteractiveIframe,
          profileId,
          sceneDropId,
          uniqueName,
          urlSlug,
          username,
          visitorId,
        },
      });
    },
    [dispatch]
  );

  const setHasSetupBackend = useCallback(
    (success: boolean) => {
      dispatch!({
        type: SET_HAS_SETUP_BACKEND,
        payload: { hasSetupBackend: success },
      });
    },
    [dispatch]
  );

  const setupBackend = () => {
    setupBackendAPI(interactiveParams).then((result) => {
      setHasSetupBackend(result.success);
      if (!result.success) navigate("*");
      else setHasInitBackendAPI(true);
    }).catch(() => navigate("*")).finally(() => setIsLoading(false))
  };

  const getTheme = () => {
    backendAPI.get("/theme").then((result) => {
      setBackgroundColor(result.data?.backgroundColor)
      dispatch!({
        type: SET_THEME,
        payload: result.data,
      });
    }).catch(() => navigate("*")).finally(() => setIsLoading(false))
  };

  useEffect(() => {
    if (interactiveParams.assetId) {
      setInteractiveParams({
        ...interactiveParams,
      });
    }
  }, [interactiveParams, setInteractiveParams]);

  useEffect(() => {
    if (!hasInitBackendAPI) setupBackend();
    else getTheme();
  }, [hasInitBackendAPI, interactiveParams]);


  if (isLoading || !hasInitBackendAPI) return <Loading />;

  return (
    <div
      className="app"
      style={{ backgroundColor, height: "100vh" }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
};

export default App;
