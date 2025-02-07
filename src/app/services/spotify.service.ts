import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, mergeMap, Observable, of, take } from 'rxjs';
import { PlaylistHelper } from '../helpers/playlist.helper';
import { Playlist, Track, TrackDetail } from '../models/models';
import { AuthService } from './auth.service';

const LIMIT = 100;

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private clientId = '0e45085f6f1c45afb1c04e6b7af61061'; // You'll need to add your Spotify Client ID
  private redirectUri = 'http://localhost:4200/callback';
  private apiUrl = 'https://api.spotify.com/v1';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getLoginUrl(): string {
    const scopes = [
      'user-read-playback-state',
      'playlist-modify-public',
      'playlist-modify-private',
    ];

    return (
      'https://accounts.spotify.com/authorize?' +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      'response_type=token'
    );
  }

  getCurrentTrack(): Observable<TrackDetail | null> {
    return this.http
      .get(`${this.apiUrl}/me/player/currently-playing`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.getStoredToken()}`,
        }),
      })
      .pipe(
        map((data: any) => {
          if (!data?.item) {
            return null;
          }

          return {
            id: data.item.id,
            uri: data.item.uri,
            title: data.item.name,
            artist: data.item.artists.map((a: any) => a.name).join(', '),
            cover: data.item.album.images[0].url,
          };
        })
      );
  }

  getUserPlaylists(): Observable<Playlist[]> {
    return this.http
      .get(`${this.apiUrl}/me/playlists`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.getStoredToken()}`,
        }),
      })
      .pipe(
        map((data: any) =>
          PlaylistHelper.sortByPriority(
            data.items.map((item: any) => ({
              id: item.id,
              uri: item.uri,
              name: item.name,
            }))
          )
        )
      );
  }

  getTracksInPlaylist(
    playlistId: string,
    prevItems: Track[] = [],
    offset: number = 0
  ): Observable<Track[]> {
    return this.http
      .get(
        `${this.apiUrl}/playlists/${playlistId}/tracks?fields=total,items(track(id,uri,name))&offset=${offset}&limit=${LIMIT}`,
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${this.authService.getStoredToken()}`,
          }),
        }
      )
      .pipe(
        take(1),
        mergeMap((data: any) => {
          const tracks: Track[] = data.items
            .filter((item: any) => item.track !== null)
            .map((item: any) => ({
              id: item.track.id,
              uri: item.track.uri,
            }));

          const allTracks = prevItems.concat(tracks);

          // If no new tracks were fetched or we've reached the total, return the results
          if (tracks.length === 0 || allTracks.length >= data.total) {
            return of(allTracks);
          }

          // Continue fetching if there are more tracks
          return this.getTracksInPlaylist(
            playlistId,
            allTracks,
            offset + LIMIT
          );
        })
      );
  }

  addToPlaylist(playlistId: string, trackUri: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/playlists/${playlistId}/tracks`,
      {
        uris: [trackUri],
      },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.getStoredToken()}`,
        }),
      }
    );
  }

  removeFromPlaylist(playlistId: string, trackUri: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/playlists/${playlistId}/tracks`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.authService.getStoredToken()}`,
      }),
      body: {
        tracks: [{ uri: trackUri }],
      },
    });
  }
}
