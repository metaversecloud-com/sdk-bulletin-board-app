import { useReducer } from "react";
import { globalReducer } from "./reducer";
import { State, ActionType } from "./types";
import GlobalState from "./GlobalState";
import { defaultTheme } from "./constants";

const initialState: State = {
  hasInteractiveParams: false,
  hasSetupBackend: false,
  isAdmin: false,
  theme: defaultTheme,
  error: "",
};

const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer<React.Reducer<State, ActionType>>(globalReducer, initialState);

  return (
    <GlobalState initialState={state} dispatch={dispatch}>
      {children}
    </GlobalState>
  );
};

export default GlobalProvider;
