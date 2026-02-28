import { Routes } from '@angular/router'
import { AuthCallbackComponent } from './components/auth-callback/auth-callback'
import { LoginComponent } from './components/login/login.component'
import { PlayerComponent } from './components/player/player.component'
import { QrAuthComponent } from './components/qr-auth/qr-auth.component'
import { QrCallbackComponent } from './components/qr-callback/qr-callback.component'
import { AuthGuard } from './guards/auth.guard'

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'callback', component: AuthCallbackComponent },
  { path: 'qr-auth', component: QrAuthComponent },
  { path: 'qr-callback', component: QrCallbackComponent },
  { path: 'player', component: PlayerComponent, canActivate: [AuthGuard] },
]
