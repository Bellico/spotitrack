
import { HttpClient, HttpParams } from '@angular/common/http'
import { inject, Injectable, DOCUMENT } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class SpotifyAuthService {
  private authUrl = 'https://accounts.spotify.com/authorize'
  private tokenUrl = 'https://accounts.spotify.com/api/token'
  private readonly win = inject(DOCUMENT)?.defaultView
  private readonly localStorage = this.win?.localStorage
  private readonly location = this.win?.location
  private clientId = environment.spotify_client_id
  private redirectUri = `${this.location?.origin}/callback`
  private http = inject(HttpClient)

  async login(customRedirectUri?: string): Promise<string> {
    const verifier = this.generateRandomString(128)

    this.localStorage?.setItem('code_verifier', verifier)

    const challenge = await this.sha256(verifier).then((hash) => this.base64encode(hash))

    const params = new HttpParams({
      fromObject: {
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: customRedirectUri ?? this.redirectUri,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        scope: 'user-read-playback-state playlist-modify-public playlist-modify-private',
      },
    })

    return `${this.authUrl}?${params.toString()}`
  }

  exchangeCodeForToken(
    code: string,
    customRedirectUri?: string,
  ): Observable<{ access_token: string; refresh_token: string }> {
    const verifier = this.localStorage?.getItem('code_verifier')

    if (!verifier) {
      return throwError(() => new Error('Code verifier not found in localStorage'))
    }

    const body = new HttpParams()
      .set('client_id', this.clientId)
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', customRedirectUri ?? this.redirectUri)
      .set('code_verifier', verifier)

    return this.http.post(this.tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }) as Observable<{ access_token: string; refresh_token: string }>
  }

  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((x) => possible[x % possible.length])
      .join('')
  }

  private async sha256(plain: string): Promise<ArrayBuffer> {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain))
  }

  private base64encode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
}
