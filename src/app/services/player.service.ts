import { Injectable, inject, signal } from '@angular/core'
import { tap } from 'rxjs'
import { Playlist, Track, TrackDetail } from '../models/models'
import { SpotifyService } from './spotify.service'

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private spotifyService = inject(SpotifyService)

  currentTrack = signal<TrackDetail | null>(null)
  playlists = signal<Playlist[]>([])
  playlistTracks = signal<Record<string, Track[]>>({})

  isTrackInPlaylist(playlistId: string): boolean {
    const currentTrack = this.currentTrack()
    if (!currentTrack || !this.playlistTracks()[playlistId]) {
      return false
    }

    return this.playlistTracks()[playlistId].some(
      (track) => track.uri === currentTrack.uri
    )
  }

  mergePlaylists(playlistId: string, tracks: Track[]) {
    this.playlistTracks.update((current) => ({
      ...current,
      [playlistId]: tracks,
    }))
  }

  addToPlaylist(playlistId: string) {
    const currentTrack = this.currentTrack()
    if (!currentTrack) {
      return
    }

    this.spotifyService
      .addToPlaylist(playlistId, currentTrack.uri)
      .pipe(
        tap(() => {
          // Mise à jour locale uniquement si l'appel API réussit
          this.playlistTracks.update((current) => ({
            ...current,
            [playlistId]: [
              ...current[playlistId],
              {
                id: currentTrack.id,
                uri: currentTrack.uri,
              },
            ],
          }))
        })
      )
      .subscribe()
  }

  removeFromPlaylist(playlistId: string) {
    const currentTrack = this.currentTrack()
    if (!currentTrack) {
      return
    }

    this.spotifyService
      .removeFromPlaylist(playlistId, currentTrack.uri)
      .pipe(
        tap(() => {
          // Mise à jour locale uniquement si l'appel API réussit
          this.playlistTracks.update((current) => ({
            ...current,
            [playlistId]:
              current[playlistId].filter((t) => t.uri !== currentTrack.uri) ||
              [],
          }))
        })
      )
      .subscribe()
  }
}
