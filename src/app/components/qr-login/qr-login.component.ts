import { afterNextRender, Component, inject, OnDestroy, signal } from '@angular/core'
import { Router } from '@angular/router'
import { toDataURL } from 'qrcode'
import { Subscription } from 'rxjs'
import { AuthService } from '../../services/auth.service'
import { QrSessionService } from '../../services/qr-session.service'

@Component({
  selector: 'app-qr-login',
  standalone: true,
  template: `
    <div class="flex flex-col items-center gap-4">
      @if (qrCodeUrl()) {
        <img [src]="qrCodeUrl()" alt="QR Code" class="rounded-lg" width="256" height="256" />
      } @else {
        <div class="w-64 h-64 bg-gray-800 rounded-lg animate-pulse"></div>
      }
    </div>
  `,
})
export class QrLoginComponent implements OnDestroy {
  private qrSessionService = inject(QrSessionService)
  private authService = inject(AuthService)
  private router = inject(Router)

  qrCodeUrl = signal<string | null>(null)

  private subscription?: Subscription

  constructor() {
    afterNextRender(() => {
      this.generateQrCode()
    })
  }

  async generateQrCode() {
    this.subscription?.unsubscribe()

    const sessionId = this.qrSessionService.createSession()
    const loginUrl = `${window.location.origin}/qr-auth?session=${sessionId}`

    const dataUrl = await toDataURL(loginUrl, {
      width: 256,
      margin: 2,
      color: { dark: '#ffffff', light: '#121212' },
    })
    this.qrCodeUrl.set(dataUrl)

    this.subscription = this.qrSessionService.listenSession(sessionId).subscribe({
      next: (token) => {
        this.authService.setToken(token)
        this.qrSessionService.deleteSession(sessionId)
        this.router.navigate(['/player'])
      },
    })
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }
}
