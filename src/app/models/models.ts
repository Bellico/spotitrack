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
