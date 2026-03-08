import { Component, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { EMPTY, switchMap, take } from 'rxjs'
import { AuthService } from '../../services/auth.service'
import { SpotifyAuthService } from '../../services/spotify-auth.service'

@Component({
  selector: 'auth-callback',
  template: '',
})
export class AuthCallbackComponent {
  private route = inject(ActivatedRoute)
  private authService = inject(AuthService)
  private router = inject(Router)
  private spotifyAuth = inject(SpotifyAuthService)

  constructor() {
    this.route.queryParamMap
      .pipe(
        take(1),
        switchMap((params) => {
          const code = params.get('code')

          if (!code) {
            this.router.navigate(['/'])

            return EMPTY
          }

          return this.spotifyAuth.exchangeCodeForToken(code)
        }),
      )
      .subscribe((token) => {
        this.authService.setTokenData(token)
        this.router.navigate(['/player'])
      })
  }
}
