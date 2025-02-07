import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Check, LucideAngularModule, Music2 } from 'lucide-angular';
import { interval, tap } from 'rxjs';
import { filter, mergeAll, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { PlayerService } from '../../services/player.service';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-player',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './player.component.html',
})
export class PlayerComponent implements OnInit {
  readonly Check = Check;
  readonly Music2 = Music2;

  private spotifyService = inject(SpotifyService);
  private playerService = inject(PlayerService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  get currentTrack() {
    return this.playerService.currentTrack;
  }

  get playlists() {
    return this.playerService.playlists;
  }

  ngOnInit() {
    interval(10000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.loadCurrentTrack())
      )
      .subscribe();

    //Initial load
    this.loadPlaylists().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.loadCurrentTrack().pipe(take(1)).subscribe();
  }

  loadCurrentTrack() {
    return this.spotifyService.getCurrentTrack().pipe(
      filter((track) => track?.id !== this.currentTrack()?.id),
      tap((track) => {
        this.currentTrack.set(track);
      })
    );
  }

  loadPlaylists() {
    return this.spotifyService.getUserPlaylists().pipe(
      tap((playlists) => {
        this.playlists.set(playlists);
      }),
      switchMap((playlists) => {
        return playlists.map((playlist) =>
          this.spotifyService.getTracksInPlaylist(playlist.id).pipe(
            tap((tracks) => {
              this.playerService.mergePlaylists(playlist.id, tracks);
            })
          )
        );
      }),
      mergeAll()
    );
  }

  isTrackInPlaylist(playlistId: string): boolean {
    return this.playerService.isTrackInPlaylist(playlistId);
  }

  togglePlaylist(playlistId: string) {
    if (this.playerService.isTrackInPlaylist(playlistId)) {
      return this.playerService.removeFromPlaylist(playlistId);
    } else {
      return this.playerService.addToPlaylist(playlistId);
    }
  }

  logout() {
    this.authService.clearToken();
    this.router.navigate(['/']);
  }
}
