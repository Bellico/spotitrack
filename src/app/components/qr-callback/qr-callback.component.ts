import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import { Component, inject, PLATFORM_ID, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { take } from 'rxjs'
import { QrSessionService } from '../../services/qr-session.service'
import { SpotifyAuthService } from '../../services/spotify-auth.service'

@Component({
  selector: 'app-qr-callback',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="p-8 rounded-lg shadow-xl bg-card max-w-md text-center">
        @if (error()) {
          <p class="text-red-400 text-lg">{{ error() }}</p>
        } @else if (success()) {
          <p class="text-green-400 text-xl font-bold mb-2">Connecté !</p>
          <p class="text-gray-400">Vous pouvez fermer cette page.</p>
        } @else {
          <p class="text-gray-400 text-lg">Connexion en cours...</p>
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

  success = signal(false)
  error = signal<string | null>(null)

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return

    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const code = params.get('code')
      const sessionId = this.win?.localStorage?.getItem('qr_session_id') ?? null

      if (!code || !sessionId) {
        this.router.navigate(['/'])
        return
      }

      const redirectUri = `${this.location?.origin}/qr-callback`

      this.spotifyAuth.exchangeCodeForToken(code, redirectUri).subscribe({
        next: async (token) => {
          await this.qrSessionService.completeSession(sessionId, token.access_token)
          this.win?.localStorage?.removeItem('qr_session_id')
          this.success.set(true)
        },
        error: () => {
          this.error.set('Erreur lors de l\'authentification.')
        },
      })
    })
  }
}
