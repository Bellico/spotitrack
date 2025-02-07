import { Routes } from '@angular/router';
import { AuthCallback } from './components/auth-callback/auth-callback';
import { LoginComponent } from './components/login/login.component';
import { PlayerComponent } from './components/player/player.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'callback', component: AuthCallback },
  { path: 'player', component: PlayerComponent, canActivate: [AuthGuard] },
];
