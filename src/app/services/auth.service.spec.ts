
import { TestBed } from '@angular/core/testing'
import { AuthService } from './auth.service'
import { DOCUMENT } from '@angular/core'
import { TokenData } from '../models/models'

function makeDocumentWithStorage(store: Record<string, string>) {
  return {
    defaultView: {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v
        },
        removeItem: (k: string) => {
          Reflect.deleteProperty(store, k)
        },
      },
    },
  }
}

const TOKEN: TokenData = { access_token: 'abc', refresh_token: 'refresh', expires_in: 3600 }

describe('AuthService', () => {
  let service: AuthService
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: makeDocumentWithStorage(store) }],
    })
    service = TestBed.inject(AuthService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('token() should be null initially', () => {
    expect(service.token()).toBeNull()
  })

  it('isAuthenticated() should be false initially', () => {
    expect(service.isAuthenticated()).toBeFalse()
  })

  it('setTokenData should update the signal', () => {
    service.setTokenData(TOKEN)
    expect(service.token()).toBe('abc')
  })

  it('setTokenData should persist access_token in localStorage', () => {
    service.setTokenData(TOKEN)
    expect(store['spotify_access_token']).toBe('abc')
  })

  it('setTokenData should persist refresh_token in localStorage', () => {
    service.setTokenData(TOKEN)
    expect(store['spotify_refresh_token']).toBe('refresh')
  })

  it('isAuthenticated() should be true after setTokenData', () => {
    service.setTokenData(TOKEN)
    expect(service.isAuthenticated()).toBeTrue()
  })

  it('clearToken should reset the signal to null', () => {
    service.setTokenData(TOKEN)
    service.clearToken()
    expect(service.token()).toBeNull()
  })

  it('clearToken should remove from localStorage', () => {
    service.setTokenData(TOKEN)
    service.clearToken()
    expect(store['spotify_access_token']).toBeUndefined()
    expect(store['spotify_refresh_token']).toBeUndefined()
  })

  it('isAuthenticated() should be false after clearToken', () => {
    service.setTokenData(TOKEN)
    service.clearToken()
    expect(service.isAuthenticated()).toBeFalse()
  })

  it('should restore token from localStorage on init', () => {
    store['spotify_access_token'] = 'stored'
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: makeDocumentWithStorage(store) }],
    })
    const restored = TestBed.inject(AuthService)

    expect(restored.token()).toBe('stored')
    expect(restored.isAuthenticated()).toBeTrue()
  })
})
