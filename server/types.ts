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
  message: string,
  userId: string,
  userName: string,
  approved: boolean,
}


export type DataObjectType = {
  messages: {
    [key: string]: MessageType
  },
  placedTextAssets: string[],
  theme: {
    id: string,
    title: string,
    subtitle: string,
    paragraph: string,
    color: string
  },
  usedSpaces: string[],
}

