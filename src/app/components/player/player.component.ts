import { Component, DestroyRef, inject, OnInit } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import { Check, LogOut, LucideAngularModule, Music2, RefreshCw } from 'lucide-angular'
import { interval, tap } from 'rxjs'
import { filter, mergeAll, switchMap, take } from 'rxjs/operators'
import { AuthService } from '../../services/auth.service'
import { PlayerService } from '../../services/player.service'
import { SpotifyService } from '../../services/spotify.service'

@Component({
  selector: 'app-player',
  imports: [LucideAngularModule],
  templateUrl: './player.component.html',
})
export class PlayerComponent implements OnInit {
  readonly Check = Check
  readonly Music2 = Music2
  readonly RefreshCw = RefreshCw
  readonly LogOut = LogOut

  private spotifyService = inject(SpotifyService)
  private playerService = inject(PlayerService)
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private router = inject(Router)

  readonly currentTrack = this.playerService.currentTrack
  readonly playlists = this.playerService.playlists

  ngOnInit() {
    interval(10000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.loadCurrentTrack()),
      )
      .subscribe()

    this.initializePlayer()
  }

  initializePlayer() {
    this.loadPlaylists().pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    this.loadCurrentTrack().pipe(take(1)).subscribe()
  }

  private loadCurrentTrack() {
    return this.spotifyService.getCurrentTrack().pipe(
      filter((track) => track?.id !== this.currentTrack()?.id),
      tap((track) => this.currentTrack.set(track)),
    )
  }

  private loadPlaylists() {
    return this.spotifyService.getUserPlaylists().pipe(
      tap((playlists) => this.playlists.set(playlists)),
      switchMap((playlists) =>
        playlists.map((playlist) =>
          this.spotifyService.getTracksInPlaylist(playlist.id).pipe(
            tap((tracks) => this.playerService.mergePlaylists(playlist.id, tracks)),
          ),
        ),
      ),
      mergeAll(),
    )
  }

  isTrackInPlaylist(playlistId: string): boolean {
    return this.playerService.isTrackInPlaylist(playlistId)
  }

  togglePlaylist(playlistId: string) {
    if (this.playerService.isTrackInPlaylist(playlistId)) {
      return this.playerService.removeFromPlaylist(playlistId)
    } else {
      return this.playerService.addToPlaylist(playlistId)
    }
  }

  logout() {
    this.authService.clearToken()
    this.router.navigate(['/'])
  }
}
