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
  imageUrl?: string,
  message?: string,
  userId: string,
  userName: string,
}

export type ThemeType = {
  [key: string]: {
    id: string,
    description: string,
    title: string,
    subtitle: string,
  }
}

export type DataObjectType = {
  anchorAssets?: string[],
  messages?: {
    [key: string]: MessageType
  },
  placedAssets?: string[],
  theme?: ThemeType,
  usedSpaces?: string[],
}

