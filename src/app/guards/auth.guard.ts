import { inject } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { map } from 'rxjs'
import { AuthService } from '../services/auth.service'

export const AuthGuard: CanActivateFn = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: ActivatedRouteSnapshot,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  return authService.isAuthenticated().pipe(
    map((isAuth) => {
      return isAuth ? true : router.createUrlTree(['/'])
    })
  )
}
