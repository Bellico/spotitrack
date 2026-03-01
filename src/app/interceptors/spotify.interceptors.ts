import { HttpHandlerFn, HttpRequest } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError } from 'rxjs'
import { AuthService } from '../services/auth.service'

export function spotifyInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService)
  const router = inject(Router)

  const token = authService.token()
  const authReq =
    token && req.url.includes('api.spotify.com')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        authService.clearToken()
        router.navigate(['/'])
      }

      throw error
    }),
  )
}
