import { DOCUMENT } from '@angular/common'
import { TestBed } from '@angular/core/testing'
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { AuthGuard } from './auth.guard'
import { AuthService } from '../services/auth.service'

const MOCK_DOCUMENT = {
  defaultView: {
    localStorage: {
      getItem: () => null,
      setItem: () => { /* noop */ },
      removeItem: () => { /* noop */ },
    },
  },
}

describe('AuthGuard', () => {
  let authService: AuthService
  let router: Router

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: DOCUMENT, useValue: MOCK_DOCUMENT },
      ],
    })
    authService = TestBed.inject(AuthService)
    router = TestBed.inject(Router)
  })

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      AuthGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    )
  }

  it('should allow access when authenticated', () => {
    authService.setToken('token')
    expect(runGuard()).toBeTrue()
  })

  it('should redirect to / when not authenticated', () => {
    const result = runGuard() as UrlTree

    expect(result).toEqual(router.createUrlTree(['/']))
  })
})
