export interface Credentials {
  assetId: string;
  displayName: string;
  interactiveNonce: string;
  interactivePublicKey: string;
  profileId: string;
  sceneDropId: string;
  username: string;
  urlSlug: string;
  visitorId: number;
}

export type MessageType = {
  id: string,
  approved: boolean,
  displayName: string,
  imageUrl?: string,
  message?: string,
  userId: string,
  username: string,
}

export type MessagesType = {
  [key: string]: MessageType
}

export type ThemeType = {
  id: string,
  description: string,
  title: string,
  subtitle: string,
}

export type DataObjectType = {
  anchorAssets: string[],
  messages: MessagesType,
  placedAssets: string[],
  theme: ThemeType,
  usedSpaces: string[],
}

