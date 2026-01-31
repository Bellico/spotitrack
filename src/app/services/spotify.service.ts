import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { map, mergeMap, Observable, of, take } from 'rxjs'
import { environment } from '../../environments/environment'
import { sortByPriority } from '../helpers/playlist.helper'
import { Playlist, Track, TrackDetail } from '../models/models'
import { CurrentTrackApi, PlaylistApi, PlaylistTrack } from '../models/models.api'
import { AuthService } from './auth.service'

const LIMIT = 100

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private apiUrl = environment.spotify_api_url
  private http = inject(HttpClient)
  private authService = inject(AuthService)

  getCurrentTrack(): Observable<TrackDetail | null> {
    return this.http
      .get(`${this.apiUrl}/me/player/currently-playing`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.getStoredToken()}`,
        }),
      })
      .pipe(
        map((data: CurrentTrackApi) => {
          if (!data?.item) {
            return null
          }

          return {
            id: data.item.id,
            uri: data.item.uri,
            title: data.item.name,
            artist: data.item.artists.map((a: {name: string}) => a.name).join(', '),
            cover: data.item.album.images[0].url,
          }
        })
      )
  }

  getUserPlaylists(): Observable<Playlist[]> {
    return this.http
      .get<PlaylistApi>(`${this.apiUrl}/me/playlists`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.getStoredToken()}`,
        }),
      })
      .pipe(
        map((data: PlaylistApi) =>
          sortByPriority(
            data.items.map((item) => ({
              id: item.id,
              uri: item.uri,
              name: item.name,
            }))
          )
        )
      )
  }

  getTracksInPlaylist(
    playlistId: string,
    prevItems: Track[] = [],
    offset = 0
  ): Observable<Track[]> {
    return this.http
      .get<PlaylistTrack>(
        `${this.apiUrl}/playlists/${playlistId}/tracks?fields=total,items(track(id,uri,name))&offset=${offset}&limit=${LIMIT}`,
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${this.authService.getStoredToken()}`,
          }),
        }
      )
      .pipe(
        take(1),
        mergeMap((data: PlaylistTrack) => {
          const tracks: Track[] = data.items
            .filter((item) => item.track !== null)
            .map((item) => ({
              id: item.track.id,
              uri: item.track.uri,
            }))

          const allTracks = prevItems.concat(tracks)

          // If no new tracks were fetched or we've reached the total, return the results
          if (tracks.length === 0 || allTracks.length >= data.total) {
            return of(allTracks)
          }

          // Continue fetching if there are more tracks
          return this.getTracksInPlaylist(
            playlistId,
            allTracks,
            offset + LIMIT
          )
        })
      )
  }

  addToPlaylist(playlistId: string, trackUri: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/playlists/${playlistId}/tracks`,
      {
        uris: [trackUri],
      },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.getStoredToken()}`,
        }),
      }
    )
  }

  removeFromPlaylist(playlistId: string, trackUri: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/playlists/${playlistId}/tracks`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.authService.getStoredToken()}`,
      }),
      body: {
        tracks: [{ uri: trackUri }],
      },
    })
  }
}
