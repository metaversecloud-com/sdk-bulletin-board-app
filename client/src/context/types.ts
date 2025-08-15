export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_INTERACTIVE_PARAMS = "SET_INTERACTIVE_PARAMS";
export const SET_THEME = "SET_THEME";

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

export interface InitialState {
  hasInteractiveParams: boolean;
  hasSetupBackend: boolean;
  theme: ThemeType;
}

export type ActionType = {
  type: string;
  payload?: object;
};

export type ThemeType = {
  id: string;
  description: string;
  subtitle: string;
  title: string;
};
