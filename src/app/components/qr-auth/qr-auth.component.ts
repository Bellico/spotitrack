import { isPlatformBrowser } from '@angular/common'
import { Component, inject, PLATFORM_ID, signal, DOCUMENT } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { EMPTY, from, switchMap, take, map } from 'rxjs'
import { QrSessionService } from '../../services/qr-session.service'
import { SpotifyAuthService } from '../../services/spotify-auth.service'

@Component({
  selector: 'app-qr-auth',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="p-8 rounded-lg shadow-xl bg-card max-w-md text-center">
        @if (error()) {
          <p class="text-red-400 text-lg">{{ error() }}</p>
        } @else {
          <p class="text-gray-400 text-lg">Redirecting to Spotify...</p>
        }
      </div>
    </div>
  `,
})
export class QrAuthComponent {
  private route = inject(ActivatedRoute)
  private spotifyAuthService = inject(SpotifyAuthService)
  private qrSessionService = inject(QrSessionService)
  private readonly win = inject(DOCUMENT)?.defaultView
  private readonly location = this.win?.location

  readonly error = signal<string | null>(null)

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return
    }

    this.route.queryParamMap
      .pipe(
        take(1),
        switchMap((params) => {
          const sessionId = params.get('session')

          if (!sessionId) {
            this.error.set('Invalid session.')

            return EMPTY
          }

          return from(this.qrSessionService.sessionExists(sessionId)).pipe(
            map((exists) => ({ exists, sessionId })),
          )
        }),
        switchMap(({ exists, sessionId }) => {
          if (!exists) {
            this.error.set('Session expired or invalid.')

            return EMPTY
          }

          this.win?.localStorage?.setItem('qr_session_id', sessionId)
          const redirectUri = `${this.location?.origin}/qr-callback`

          return from(this.spotifyAuthService.login(redirectUri))
        }),
      )
      .subscribe((loginUrl) => {
        if (this.location) {
          this.location.href = loginUrl
        }
      })
  }
}
