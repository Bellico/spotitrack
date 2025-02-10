export interface TrackApi {
  id: string
  uri: string
  name: string
  artists: {name: string}[]
  album: {images: {url: string}[]}
}

export interface CurrentTrackApi {
  item?:TrackApi
}

export interface PlaylistTrack {
  total: number
  items: {
    track: TrackApi
  }[]
}

export interface PlaylistApi {
  items: TrackApi[]
}
