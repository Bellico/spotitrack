import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import { Component, inject, PLATFORM_ID, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { take } from 'rxjs'
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
          <p class="text-gray-400 text-lg">Redirection vers Spotify...</p>
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

  error = signal<string | null>(null)

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return

    this.route.queryParamMap.pipe(take(1)).subscribe(async (params) => {
      const sessionId = params.get('session')

      if (!sessionId) {
        this.error.set('Session invalide.')
        return
      }

      const exists = await this.qrSessionService.sessionExists(sessionId)
      if (!exists) {
        this.error.set('Session expirée ou invalide.')
        return
      }

      this.win?.localStorage?.setItem('qr_session_id', sessionId)

      const redirectUri = `${this.location?.origin}/qr-callback`
      const loginUrl = await this.spotifyAuthService.login(redirectUri)

      if (this.location) this.location.href = loginUrl
    })
  }
}
