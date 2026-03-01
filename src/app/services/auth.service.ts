
import { computed, inject, Injectable, signal, DOCUMENT } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'spotify_access_token'
  private readonly localStorage = inject(DOCUMENT)?.defaultView?.localStorage

  readonly token = signal<string | null>(this.getStoredToken())
  readonly isAuthenticated = computed(() => this.token() !== null)

  setToken(value: string) {
    this.localStorage?.setItem(this.tokenKey, value)
    this.token.set(value)
  }

  getStoredToken(): string | null {
    return this.localStorage?.getItem(this.tokenKey) ?? null
  }

  clearToken() {
    this.localStorage?.removeItem(this.tokenKey)
    this.token.set(null)
  }
}
