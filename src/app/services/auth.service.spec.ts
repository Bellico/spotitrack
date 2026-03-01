import { DOCUMENT } from '@angular/common'
import { TestBed } from '@angular/core/testing'
import { AuthService } from './auth.service'

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

  it('setToken should update the signal', () => {
    service.setToken('abc')
    expect(service.token()).toBe('abc')
  })

  it('setToken should persist in localStorage', () => {
    service.setToken('abc')
    expect(store['spotify_access_token']).toBe('abc')
  })

  it('isAuthenticated() should be true after setToken', () => {
    service.setToken('abc')
    expect(service.isAuthenticated()).toBeTrue()
  })

  it('clearToken should reset the signal to null', () => {
    service.setToken('abc')
    service.clearToken()
    expect(service.token()).toBeNull()
  })

  it('clearToken should remove from localStorage', () => {
    service.setToken('abc')
    service.clearToken()
    expect(store['spotify_access_token']).toBeUndefined()
  })

  it('isAuthenticated() should be false after clearToken', () => {
    service.setToken('abc')
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
