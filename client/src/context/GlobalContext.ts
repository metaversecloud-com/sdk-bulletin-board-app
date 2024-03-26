import { createContext } from "react";
import { defaultTheme } from "./constants";
import { ActionType, InitialState } from "./types";

export const GlobalStateContext = createContext<InitialState>({
  hasInteractiveParams: false, hasSetupBackend: false, theme: defaultTheme
});

export const GlobalDispatchContext = createContext<React.Dispatch<ActionType> | null>(null);
