import { DOCUMENT } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { filter, take } from 'rxjs'
import { AuthService } from '../../services/auth.service'
import { SpotifyAuthService } from '../../services/spotify-auth.service'
import { ButtonComponent } from '../button/button.component'

@Component({
  selector: 'app-login',
  imports: [ButtonComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private spotifyAuthService = inject(SpotifyAuthService)
  private authService = inject(AuthService)
  private router = inject(Router)
  private readonly location = inject(DOCUMENT)?.defaultView?.location

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
