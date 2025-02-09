import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SpotifyService } from '../../services/spotify.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-login',
  imports: [ButtonComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private spotifyService = inject(SpotifyService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.authService
      .isAuthenticated()
      .pipe(
        filter((isAuth) => isAuth),
        take(1)
      )
      .subscribe(() => {
        this.router.navigate(['/player']);
      });
  }

  login() {
    const loginUrl = this.spotifyService.getLoginUrl();
    window.location.href = loginUrl;
  }
}
