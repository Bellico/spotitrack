import { Component, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { take } from 'rxjs'
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
      .pipe(take(1))
      .subscribe(params => {
        const code = params.get('code')
        // const code = this.route.snapshot.queryParamMap.get('code')

        if (code) {
          this.spotifyAuth.exchangeCodeForToken(code).subscribe((token) => {
            console.log('Received token:', token)
            this.authService.setToken(token.access_token)
            // localStorage.setItem('spotify_refresh_token', token.refresh_token);
            this.router.navigate(['/player'])
          })
        } else {
          this.router.navigate(['/'])
        }
      })
  }
}
