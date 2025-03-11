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
  theme: {
    id: string;
    description: string;
    subtitle: string;
    title: string;
  };
}

export type ActionType = {
  type: string;
  payload?: object;
};

export const ThemeIds: { [key: string]: string } = {
  GRATITUDE: "Gratitude Garden",
  FRIENDSHIP: "Friendship Garden",
  CHALK: "Chalk the Block",
  CAR: "Decorate your car",
};
