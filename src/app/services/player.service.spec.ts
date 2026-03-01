import { DOCUMENT } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { PlayerService } from './player.service'

const MOCK_DOCUMENT = {
  defaultView: {
    localStorage: {
      getItem: () => null,
      setItem: () => { /* noop */ },
      removeItem: () => { /* noop */ },
    },
  },
}

describe('PlayerService', () => {
  let service: PlayerService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DOCUMENT, useValue: MOCK_DOCUMENT },
      ],
    })
    service = TestBed.inject(PlayerService)
  })

  describe('isTrackInPlaylist', () => {
    it('should return false when no current track', () => {
      expect(service.isTrackInPlaylist('p1')).toBeFalse()
    })

    it('should return false when playlist has no tracks loaded', () => {
      service.currentTrack.set({ id: '1', uri: 'spotify:track:1', title: 'T', artist: 'A', cover: '' })
      expect(service.isTrackInPlaylist('p1')).toBeFalse()
    })

    it('should return true when current track is in playlist', () => {
      service.currentTrack.set({ id: '1', uri: 'spotify:track:1', title: 'T', artist: 'A', cover: '' })
      service.mergePlaylists('p1', [{ id: '1', uri: 'spotify:track:1' }])
      expect(service.isTrackInPlaylist('p1')).toBeTrue()
    })

    it('should return false when current track is not in playlist', () => {
      service.currentTrack.set({ id: '1', uri: 'spotify:track:1', title: 'T', artist: 'A', cover: '' })
      service.mergePlaylists('p1', [{ id: '2', uri: 'spotify:track:2' }])
      expect(service.isTrackInPlaylist('p1')).toBeFalse()
    })
  })

  describe('mergePlaylists', () => {
    it('should add tracks for a new playlist', () => {
      service.mergePlaylists('p1', [{ id: '1', uri: 'spotify:track:1' }])
      expect(service.playlistTracks()['p1'].length).toBe(1)
    })

    it('should replace tracks for an existing playlist', () => {
      service.mergePlaylists('p1', [{ id: '1', uri: 'spotify:track:1' }])
      service.mergePlaylists('p1', [{ id: '2', uri: 'spotify:track:2' }, { id: '3', uri: 'spotify:track:3' }])
      expect(service.playlistTracks()['p1'].length).toBe(2)
    })

    it('should not affect other playlists', () => {
      service.mergePlaylists('p1', [{ id: '1', uri: 'spotify:track:1' }])
      service.mergePlaylists('p2', [{ id: '2', uri: 'spotify:track:2' }])
      expect(service.playlistTracks()['p1'].length).toBe(1)
      expect(service.playlistTracks()['p2'].length).toBe(1)
    })
  })
})
