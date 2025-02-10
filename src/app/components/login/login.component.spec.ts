import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { AuthService } from '../../services/auth.service'
import { SpotifyService } from '../../services/spotify.service'
import { LoginComponent } from './login.component'

describe('LoginComponent', () => {
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>
  let mockRouter: jasmine.SpyObj<Router>
  let mockAuthService: jasmine.SpyObj<AuthService>
  let mockSpotifyService: jasmine.SpyObj<SpotifyService>

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate'])
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated'])
    mockSpotifyService = jasmine.createSpyObj('SpotifyService', ['getLoginUrl'])

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SpotifyService, useValue: mockSpotifyService },
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(LoginComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should navigate to player when authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(of(true))
    fixture.detectChanges()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/player'])
  })

  it('should not navigate when not authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(of(false))
    fixture.detectChanges()
    expect(mockRouter.navigate).not.toHaveBeenCalled()
  })
})
