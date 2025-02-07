import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-callback',
  template: '',
})
export class AuthCallback {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.route.fragment.pipe().subscribe((fragment) => {
      if (fragment == null) {
        this.router.navigate(['/']);
        return;
      }

      const params = new URLSearchParams(fragment);
      const token = params.get('access_token');

      if (token) {
        this.authService.setToken(token);
        this.router.navigate(['/player']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}
