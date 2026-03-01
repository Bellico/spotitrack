import { Routes } from '@angular/router'
import { AuthGuard } from './guards/auth.guard'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./components/auth-callback/auth-callback').then((m) => m.AuthCallbackComponent),
  },
  {
    path: 'qr-auth',
    loadComponent: () =>
      import('./components/qr-auth/qr-auth.component').then((m) => m.QrAuthComponent),
  },
  {
    path: 'qr-callback',
    loadComponent: () =>
      import('./components/qr-callback/qr-callback.component').then((m) => m.QrCallbackComponent),
  },
  {
    path: 'player',
    loadComponent: () =>
      import('./components/player/player.component').then((m) => m.PlayerComponent),
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' },
]
