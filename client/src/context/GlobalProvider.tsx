import { useReducer } from "react";
import { globalReducer } from "./reducer";
import { InitialState } from "./types";
import { defaultTheme } from "./constants";
import GlobalState from "./GlobalState";

const initialState: InitialState = {
  hasInteractiveParams: false,
  hasSetupBackend: false,
  theme: defaultTheme,
};

const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <GlobalState initialState={state} dispatch={dispatch}>
      {children}
    </GlobalState>
  );
};

export default GlobalProvider;
