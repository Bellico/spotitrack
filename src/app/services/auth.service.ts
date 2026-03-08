
import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { TokenData } from '../models/models'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'spotify_access_token'
  private refreshTokenKey = 'spotify_refresh_token'
  private tokenExpiryKey = 'spotify_token_expiry'
  private readonly localStorage = inject(DOCUMENT)?.defaultView?.localStorage

  readonly token = signal<string | null>(this.getStoredToken())
  readonly isAuthenticated = computed(() => this.token() !== null)

  isRefreshing = false
  readonly refreshToken$ = new BehaviorSubject<string | null>(null)

  setTokenData(tokenData: TokenData) {
    const expiresAt = Date.now() + (tokenData.expires_in - 60) * 1000

    this.localStorage?.setItem(this.tokenKey, tokenData.access_token)
    this.localStorage?.setItem(this.refreshTokenKey, tokenData.refresh_token)
    this.localStorage?.setItem(this.tokenExpiryKey, expiresAt.toString())
    this.token.set(tokenData.access_token)
  }

  getStoredToken(): string | null {
    return this.localStorage?.getItem(this.tokenKey) ?? null
  }

  getRefreshToken(): string | null {
    return this.localStorage?.getItem(this.refreshTokenKey) ?? null
  }

  startRefreshing() {
    this.isRefreshing = true
    this.refreshToken$.next(null)
  }

  stopRefreshing(token: string |null) {
    this.isRefreshing = false
    this.refreshToken$.next(token)
  }

  clearToken() {
    this.localStorage?.removeItem(this.tokenKey)
    this.localStorage?.removeItem(this.refreshTokenKey)
    this.localStorage?.removeItem(this.tokenExpiryKey)
    this.token.set(null)
  }
}
