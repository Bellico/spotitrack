import { isPlatformBrowser } from '@angular/common'
import { Component, effect, inject, PLATFORM_ID, signal, DOCUMENT } from '@angular/core'
import { Router } from '@angular/router'
import { Headphones, LogIn, LucideAngularModule } from 'lucide-angular'
import { AuthService } from '../../services/auth.service'
import { SpotifyAuthService } from '../../services/spotify-auth.service'
import { QrLoginComponent } from '../qr-login/qr-login.component'

@Component({
  selector: 'app-login',
  imports: [LucideAngularModule, QrLoginComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private spotifyAuthService = inject(SpotifyAuthService)
  private authService = inject(AuthService)
  private router = inject(Router)
  private readonly location = inject(DOCUMENT)?.defaultView?.location

  readonly Headphones = Headphones
  readonly LogIn = LogIn
  readonly isDesktop = signal(
    isPlatformBrowser(inject(PLATFORM_ID))
      ? !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      : false,
  )

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/player'])
      }
    })
  }

  async login() {
    if (!this.location) {
      return
    }

    const loginUrl = await this.spotifyAuthService.login()

    this.location.href = loginUrl
  }
}
