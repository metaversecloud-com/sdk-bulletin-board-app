export interface Credentials {
  assetId: string;
  displayName: string;
  identityId: string;
  interactiveNonce: string;
  interactivePublicKey: string;
  profileId: string;
  sceneDropId: string;
  username: string;
  urlSlug: string;
  visitorId: number;
}

export type MessageType = {
  id: string;
  approved: boolean;
  displayName: string;
  imageUrl?: string;
  message?: string;
  userId: string;
  username: string;
};

export type MessagesType = {
  [key: string]: MessageType;
};

export type ThemeType = {
  id: string;
  description: string;
  subtitle: string;
  title: string;
  type: string;
};

export type DataObjectType = {
  anchorAssets: string[]; // array of dropped asset ids
  messages: MessagesType;
  theme: ThemeType;
  usedSpaces: string[]; // list of anchorAssets that have already been used
};
