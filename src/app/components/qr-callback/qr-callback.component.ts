import { isPlatformBrowser } from '@angular/common'
import { Component, DOCUMENT, inject, PLATFORM_ID, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { catchError, EMPTY, from, switchMap, take, tap } from 'rxjs'
import { QrSessionService } from '../../services/qr-session.service'
import { SpotifyAuthService } from '../../services/spotify-auth.service'

@Component({
  selector: 'app-qr-callback',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="p-8 rounded-lg shadow-xl bg-card max-w-md text-center">
        @if (error()) {
          <p class="text-red-400 text-lg">{{ error() }}</p>
        } @else if (success()) {
          <p class="text-green-400 text-xl font-bold mb-2">Connected!</p>
          <p class="text-gray-400">You can close this page.</p>
        } @else {
          <p class="text-gray-400 text-lg">Connecting...</p>
        }
      </div>
    </div>
  `,
})
export class QrCallbackComponent {
  private route = inject(ActivatedRoute)
  private spotifyAuth = inject(SpotifyAuthService)
  private qrSessionService = inject(QrSessionService)
  private readonly win = inject(DOCUMENT)?.defaultView
  private readonly location = this.win?.location
  private router = inject(Router)

  readonly success = signal(false)
  readonly error = signal<string | null>(null)

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return
    }

    const sessionId = this.qrSessionService.getQrSessionId()

    if (!sessionId) {
      this.router.navigate(['/'])

      return
    }

    this.route.queryParamMap
      .pipe(
        take(1),
        switchMap(params => {
          const code = params.get('code')

          if (!code) {
            this.router.navigate(['/'])

            return EMPTY
          }

          const redirectUri = `${this.location?.origin}/qr-callback`

          return this.spotifyAuth.exchangeCodeForToken(code, redirectUri)
        }),
        switchMap(token =>
          from(this.qrSessionService.completeSession(sessionId, token))),
        tap(() => {
          this.qrSessionService.clearQrSessionId()
          this.success.set(true)
        }),
        catchError(err => {
          this.qrSessionService.clearQrSessionId()
          this.error.set(`Authentication failed. ${err.toString()}`)

          return EMPTY
        }),
      ).subscribe()
  }
}
