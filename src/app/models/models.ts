export interface Playlist {
  id: string
  uri: string
  name: string
}

export interface Track {
  uri: string
  id: string
}

export type TrackDetail = Track & {
  title: string
  artist: string
  cover: string
}

export interface QrSession {
  status: 'pending' | 'done'
  access_token?: string
  refresh_token?: string
  expires_in?: number
  createdAt?: number
}

export interface TokenData {
  access_token: string
  refresh_token: string
  expires_in: number
}
