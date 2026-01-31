import { DOCUMENT } from '@angular/common'
import { HttpClient, HttpParams } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class SpotifyAuthService {
  private authUrl = 'https://accounts.spotify.com/authorize'
  private tokenUrl = 'https://accounts.spotify.com/api/token'
  private readonly location = inject(DOCUMENT)?.defaultView?.location
  private clientId = environment.spotify_client_id
  private redirectUri = `${this.location?.origin}/callback`
  private http = inject(HttpClient)

  /**
   * 🔑 Login Spotify
   */
  async login(): Promise<string> {
    const verifier = this.generateRandomString(128)
    localStorage.setItem('code_verifier', verifier)

    const challenge = await this.sha256(verifier).then((hash) =>
      this.base64encode(hash),
    )

    const scopes = [
      'user-read-playback-state',
      'playlist-modify-public',
      'playlist-modify-private',
    ]

    const params = new HttpParams({
      fromObject: {
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        scope: scopes.join(' '),
      },
    })

    return `${this.authUrl}?${params.toString()}`
  }

  /**
   * 🔄 Échange code → token
   */
  exchangeCodeForToken(code: string ): Observable<{ access_token: string; refresh_token: string }> {
    const verifier = localStorage.getItem('code_verifier')

    if (!verifier) {
      return throwError(
        () => new Error('Code verifier not found in localStorage'),
      )
    }

    const body = new HttpParams()
      .set('client_id', this.clientId)
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('code_verifier', verifier)

    return this.http.post(
      this.tokenUrl,
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ) as Observable<{ access_token: string; refresh_token: string }>
  }

  private generateRandomString(length: number): string {
    const possible ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((x) => possible[x % possible.length])
      .join('')
  }

  private async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    return crypto.subtle.digest('SHA-256', encoder.encode(plain))
  }

  private base64encode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
}
