import { createContext } from "react";
import { defaultTheme } from "./constants";
import { ActionType, State } from "./types";

export const GlobalStateContext = createContext<State>({
  hasInteractiveParams: false,
  hasSetupBackend: false,
  isAdmin: false,
  theme: defaultTheme,
  error: "",
});

export const GlobalDispatchContext = createContext<React.Dispatch<ActionType> | null>(null);
