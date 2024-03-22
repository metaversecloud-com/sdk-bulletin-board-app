import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

// pages
import Home from "./pages/Home";
import Error from "./pages/Error";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);
  const [background, setBackground] = useState<string>("white");

  const dispatch = useContext(GlobalDispatchContext);

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

  const setupBackend = async () => {
    const setupResult = await setupBackendAPI(interactiveParams);
    setHasSetupBackend(setupResult.success);
    if (!setupResult.success) navigate("*");
    else setHasInitBackendAPI(true);
  };

  const getTheme = async () => {
    try {
      const { data } = await backendAPI.get("/theme");
      setBackground(data.backgroundColor)
      dispatch!({
        type: SET_THEME,
        payload: data.theme,
      });
    } catch (error) {
      console.log(error);
    }
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

  return (
    <div
      className="app"
      style={{ background }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
};

export default App;
