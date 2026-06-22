export const SET_HAS_INTERACTIVE_PARAMS = "SET_HAS_INTERACTIVE_PARAMS";
export const SET_IS_ADMIN = "SET_IS_ADMIN";
export const SET_THEME = "SET_THEME";
export const SET_CAN_SWITCH_SCENES = "SET_CAN_SWITCH_SCENES";
export const SET_AVAILABLE_THEME_IDS = "SET_AVAILABLE_THEME_IDS";
export const SET_ERROR = "SET_ERROR";

// Canonical theme enum lives in shared/ so client and server can't drift.
// Re-exported here so the many `@/context/types` consumers don't need to
// change their imports.
export { ThemeIds } from "@shared/types/ThemeTypes";
import { ThemeIds } from "@shared/types/ThemeTypes";

export type InteractiveParams = {
  assetId: string;
  displayName: string;
  identityId: string;
  interactiveNonce: string;
  interactivePublicKey: string;
  profileId: string;
  sceneDropId: string;
  uniqueName: string;
  urlSlug: string;
  username: string;
  visitorId: string;
  canSwitchScenes?: boolean;
};

export interface State {
  hasInteractiveParams?: boolean;
  hasSetupBackend?: boolean;
  isAdmin?: boolean;
  theme?: ThemeType;
  canSwitchScenes?: boolean;
  /** Theme IDs whose SCENE_ID_<id> env var is set on the server. Themes not
   * in this list are hidden from the admin's theme-switcher dropdown — they
   * exist in code but the ecosystem hasn't provisioned the required scene. */
  availableThemeIds?: string[];
  error?: string;
}

export type ActionType = {
  type: string;
  payload: State;
};

export type ThemeType = {
  id: keyof typeof ThemeIds;
  description: string;
  subtitle: string;
  title: string;
};

export type ErrorType =
  | string
  | {
      message?: string;
      response?: { data?: { error?: { message?: string }; message?: string } };
    };
