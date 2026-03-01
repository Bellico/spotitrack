import { Component, computed, NO_ERRORS_SCHEMA, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { SpotifyAuthService } from '../../services/spotify-auth.service'
import { LoginComponent } from './login.component'

@Component({ selector: 'app-qr-login', standalone: true, template: '' })
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class QrLoginStubComponent {}

class FakeAuthService {
  readonly token = signal<string | null>(null)
  readonly isAuthenticated = computed(() => this.token() !== null)
  setToken(v: string) {
    this.token.set(v)
  }
  clearToken() {
    this.token.set(null)
  }
  getStoredToken() {
    return null
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>
  let fakeAuth: FakeAuthService
  let router: Router

  beforeEach(async () => {
    fakeAuth = new FakeAuthService()

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: fakeAuth },
        {
          provide: SpotifyAuthService,
          useValue: { login: () => Promise.resolve('https://spotify/auth') },
        },
      ],
    })
      .overrideComponent(LoginComponent, {
        set: { imports: [QrLoginStubComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents()

    router = TestBed.inject(Router)
    spyOn(router, 'navigate')

    fixture = TestBed.createComponent(LoginComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should navigate to /player when already authenticated', () => {
    fakeAuth.setToken('token')
    fixture.detectChanges()
    expect(router.navigate).toHaveBeenCalledWith(['/player'])
  })

  it('should not navigate when not authenticated', () => {
    fixture.detectChanges()
    expect(router.navigate).not.toHaveBeenCalled()
  })

  it('should navigate to /player when token is set after init', () => {
    fixture.detectChanges()
    fakeAuth.setToken('token')
    fixture.detectChanges()
    expect(router.navigate).toHaveBeenCalledWith(['/player'])
  })
})
