export const SET_HAS_INTERACTIVE_PARAMS = "SET_HAS_INTERACTIVE_PARAMS";
export const SET_IS_ADMIN = "SET_IS_ADMIN";
export const SET_THEME = "SET_THEME";
export const SET_ERROR = "SET_ERROR";

export enum ThemeIds {
  CHALK = "CHALK",
  GRATITUDE = "GRATITUDE",
  FRIENDSHIP = "FRIENDSHIP",
  BULLETIN = "BULLETIN",
  BULLETIN_SKETCH = "BULLETIN_SKETCH",
  ART = "ART",
  HARVEST = "HARVEST",
  CAR = "CAR",
}

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
};

export interface State {
  hasInteractiveParams?: boolean;
  hasSetupBackend?: boolean;
  isAdmin?: boolean;
  theme?: ThemeType;
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
