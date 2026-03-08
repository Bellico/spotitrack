import { HttpHandlerFn, HttpRequest } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, filter, switchMap, take } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { SpotifyAuthService } from '../services/spotify-auth.service'

export function spotifyInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService)
  const spotifyAuth = inject(SpotifyAuthService)
  const router = inject(Router)

  const token = authService.token()

  const authReq =
    token && req.url.includes('api.spotify.com')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status !== 401 || !req.url.includes('api.spotify.com')) {
        throw error
      }

      const refreshToken = authService.getRefreshToken()

      if (!refreshToken) {
        authService.clearToken()
        router.navigate(['/'])
        throw error
      }

      if (authService.isRefreshing) {
        return authService.refreshToken$.pipe(
          filter(t => !!t),
          take(1),
          switchMap((newToken) => next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))),
        )
      }

      authService.startRefreshing()

      return spotifyAuth.refreshAccessToken(refreshToken).pipe(
        switchMap((data) => {
          authService.setTokenData(data)
          authService.stopRefreshing(data.access_token)

          return next(req.clone({ setHeaders: { Authorization: `Bearer ${data.access_token}` } }))
        }),
        catchError(() => {
          authService.stopRefreshing(null)
          authService.clearToken()
          router.navigate(['/'])
          throw error
        }),
      )
    }),
  )
}
