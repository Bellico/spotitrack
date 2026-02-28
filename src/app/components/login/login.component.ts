import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core'
import { Router } from '@angular/router'
import { filter, take } from 'rxjs'
import { Headphones, LogIn, LucideAngularModule } from 'lucide-angular'
import { AuthService } from '../../services/auth.service'
import { SpotifyAuthService } from '../../services/spotify-auth.service'
import { QrLoginComponent } from '../qr-login/qr-login.component'

@Component({
  selector: 'app-login',
  imports: [LucideAngularModule, QrLoginComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private spotifyAuthService = inject(SpotifyAuthService)
  private authService = inject(AuthService)
  private router = inject(Router)
  private readonly location = inject(DOCUMENT)?.defaultView?.location

  readonly Headphones = Headphones
  readonly LogIn = LogIn

  isDesktop = signal(false)

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.isDesktop.set(!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
    }
  }

  ngOnInit() {
    this.authService
      .isAuthenticated()
      .pipe(
        filter((isAuth) => isAuth),
        take(1),
      )
      .subscribe(() => {
        this.router.navigate(['/player'])
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
