import { ActionType, State, SET_HAS_INTERACTIVE_PARAMS, SET_IS_ADMIN, SET_THEME, SET_ERROR } from "./types";

const globalReducer = (state: State, action: ActionType) => {
  const { type, payload } = action;
  switch (type) {
    case SET_HAS_INTERACTIVE_PARAMS:
      return {
        ...state,
        hasInteractiveParams: payload.hasInteractiveParams,
      };
    case SET_IS_ADMIN:
      return {
        ...state,
        isAdmin: payload.isAdmin,
      };
    case SET_THEME:
      return {
        ...state,
        theme: payload.theme,
        error: "",
      };
    case SET_ERROR:
      return {
        ...state,
        error: payload.error,
      };
    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
};

export { globalReducer };
