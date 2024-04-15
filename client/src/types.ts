export interface MessageI {
  id: string,
  approved: boolean,
  displayName?: string,
  imageUrl?: string,
  message?: string,
  userId: string,
  username?: string,
}

export type AdminFormValues = {
  id: string,
  title: string,
  subtitle: string,
  description: string,
}

export type MessageFormValues = {
  images: Blob[],
  message: string,
}