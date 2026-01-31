import { DOCUMENT } from '@angular/common'
import { inject, Injectable } from '@angular/core'
import { BehaviorSubject, map, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'spotify_access_token'
  private readonly localStorage = inject(DOCUMENT)?.defaultView?.localStorage

  private tokenSubject = new BehaviorSubject<string | null>(
    this.getStoredToken(),
  )

  setToken(token: string) {
    this.localStorage?.setItem(this.tokenKey, token)
    this.tokenSubject.next(token)
  }

  isAuthenticated(): Observable<boolean> {
    return this.getToken().pipe(map((t) => t !== null))
  }

  getToken() {
    return this.tokenSubject.asObservable()
  }

  getStoredToken(): string | null {
    return this.localStorage?.getItem(this.tokenKey) ?? null
  }

  clearToken() {
    this.localStorage?.removeItem(this.tokenKey)
    this.tokenSubject.next(null)
  }
}
