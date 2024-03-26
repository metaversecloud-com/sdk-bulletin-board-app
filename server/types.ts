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


export type DataObjectType = {
  messages?: {
    [key: string]: MessageType
  },
  placedTextAssets?: string[],
  theme?: {
    id: string,
    backgroundColor: string
    description: string,
    title: string,
    subtitle: string,
  },
  usedSpaces?: string[],
}

