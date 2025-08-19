import { useContext, useState, useEffect } from "react";

// components
import { Board, PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { ErrorType, SET_IS_ADMIN, SET_THEME } from "@/context/types";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/game-state")
        .then((response) => {
          const { isAdmin, theme } = response.data;
          dispatch!({
            type: SET_IS_ADMIN,
            payload: { isAdmin },
          });
          dispatch!({
            type: SET_THEME,
            payload: { theme },
          });
        })
        .catch((error) => setErrorMessage(dispatch, error as ErrorType))
        .finally(() => setIsLoading(false));
    }
  }, [hasInteractiveParams]);

  return (
    <PageContainer isLoading={isLoading}>
      <Board />
    </PageContainer>
  );
}

export default Home;
