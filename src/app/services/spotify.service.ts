import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { catchError, map, mergeMap, Observable, of, take } from 'rxjs'
import { environment } from '../../environments/environment'
import { sortByPriority } from '../helpers/playlist.helper'
import { Playlist, Track, TrackDetail } from '../models/models'
import { CurrentTrackApi, PlaylistApi, PlaylistTrack } from '../models/models.api'

const LIMIT = 100

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private apiUrl = environment.spotify_api_url
  private http = inject(HttpClient)

  getCurrentTrack(): Observable<TrackDetail | null> {
    return this.http.get<CurrentTrackApi>(`${this.apiUrl}/me/player/currently-playing`).pipe(
      map((data) => {
        if (!data?.item) {
          return null
        }

        return {
          id: data.item.id,
          uri: data.item.uri,
          title: data.item.name,
          artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
          cover: data.item.album.images[0].url,
        }
      }),
      catchError(() => of(null)),
    )
  }

  getUserPlaylists(): Observable<Playlist[]> {
    return this.http.get<PlaylistApi>(`${this.apiUrl}/me/playlists`).pipe(
      map((data) =>
        sortByPriority(
          data.items.map((item) => ({
            id: item.id,
            uri: item.uri,
            name: item.name,
          })),
        ),
      ),
    )
  }

  getTracksInPlaylist(playlistId: string, prevItems: Track[] = [], offset = 0): Observable<Track[]> {
    return this.http
      .get<PlaylistTrack>(
        `${this.apiUrl}/playlists/${playlistId}/tracks?fields=total,items(track(id,uri,name))&offset=${offset}&limit=${LIMIT}`,
      )
      .pipe(
        take(1),
        mergeMap((data) => {
          const tracks: Track[] = data.items
            .filter((item) => item.track !== null)
            .map((item) => ({ id: item.track.id, uri: item.track.uri }))

          const allTracks = prevItems.concat(tracks)

          if (tracks.length === 0 || allTracks.length >= data.total) {
            return of(allTracks)
          }

          return this.getTracksInPlaylist(playlistId, allTracks, offset + LIMIT)
        }),
      )
  }

  addToPlaylist(playlistId: string, trackUri: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/playlists/${playlistId}/tracks`, { uris: [trackUri] })
  }

  removeFromPlaylist(playlistId: string, trackUri: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/playlists/${playlistId}/tracks`, {
      body: { tracks: [{ uri: trackUri }] },
    })
  }

  skipToNext(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/player/next`, {})
  }
}
