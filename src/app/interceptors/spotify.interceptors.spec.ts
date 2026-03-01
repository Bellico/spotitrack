
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { DOCUMENT } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { AuthService } from '../services/auth.service'
import { spotifyInterceptor } from './spotify.interceptors'

const MOCK_DOCUMENT = {
  defaultView: {
    localStorage: {
      getItem: () => null,
      setItem: () => { /* noop */ },
      removeItem: () => { /* noop */ },
    },
  },
}

describe('spotifyInterceptor', () => {
  let authService: AuthService
  let httpClient: HttpClient
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([spotifyInterceptor])),
        provideHttpClientTesting(),
        { provide: DOCUMENT, useValue: MOCK_DOCUMENT },
      ],
    })
    authService = TestBed.inject(AuthService)
    httpClient = TestBed.inject(HttpClient)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpMock.verify())

  it('should add Authorization header for api.spotify.com requests', () => {
    authService.setToken('my-token')
    httpClient.get('https://api.spotify.com/v1/me').subscribe()

    const req = httpMock.expectOne('https://api.spotify.com/v1/me')

    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token')
    req.flush({})
  })

  it('should NOT add Authorization header when no token', () => {
    httpClient.get('https://api.spotify.com/v1/me').subscribe()

    const req = httpMock.expectOne('https://api.spotify.com/v1/me')

    expect(req.request.headers.get('Authorization')).toBeNull()
    req.flush({})
  })

  it('should NOT add Authorization header for non-Spotify API URLs', () => {
    authService.setToken('my-token')
    httpClient.get('https://accounts.spotify.com/api/token').subscribe()

    const req = httpMock.expectOne('https://accounts.spotify.com/api/token')

    expect(req.request.headers.get('Authorization')).toBeNull()
    req.flush({})
  })

  it('should clear token and navigate on 401', () => {
    authService.setToken('expired-token')
    httpClient.get('https://api.spotify.com/v1/me').subscribe({ error: () => { /* expected */ } })

    const req = httpMock.expectOne('https://api.spotify.com/v1/me')

    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' })

    expect(authService.token()).toBeNull()
  })
})
