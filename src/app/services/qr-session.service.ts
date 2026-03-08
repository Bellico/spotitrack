import { isPlatformBrowser } from '@angular/common'
import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core'
import { initializeApp } from 'firebase/app'
import { Database, get, getDatabase, onValue, ref, remove, set } from 'firebase/database'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { QrSession, TokenData } from '../models/models'

@Injectable({
  providedIn: 'root',
})
export class QrSessionService {
  private qrSessionKey = 'qr_session_id'
  private readonly localStorage = inject(DOCUMENT)?.defaultView?.localStorage

  private readonly platformId = inject(PLATFORM_ID)
  private db: Database | null = null

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const app = initializeApp(environment.firebase)

      this.db = getDatabase(app)
    }
  }

  getQrSessionId(): string | null {
    return this.localStorage?.getItem(this.qrSessionKey) ?? null
  }

  setQrSessionId(qrSessionId: string) {
    this.localStorage?.setItem(this.qrSessionKey, qrSessionId)
  }

  clearQrSessionId() {
    this.localStorage?.removeItem(this.qrSessionKey)
  }

  createSession(): string {
    const sessionId = crypto.randomUUID()

    if (this.db) {
      const sessionRef = ref(this.db, `sessions/${sessionId}`)

      set(sessionRef, { status: 'pending', createdAt: Date.now() })
    }

    return sessionId
  }

  listenSession(sessionId: string): Observable<TokenData> {
    return new Observable((subscriber) => {
      if (!this.db) {
        return
      }

      const sessionRef = ref(this.db, `sessions/${sessionId}`)
      const unsubscribe = onValue(sessionRef, (snapshot) => {
        const data = snapshot.val() as QrSession | null

        if (data?.status === 'done') {
          subscriber.next({
            access_token: data.access_token ?? '',
            refresh_token: data.refresh_token ?? '',
            expires_in: data.expires_in ?? 0,
          })

          subscriber.complete()
        }
      })

      return () => unsubscribe()
    })
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    if (!this.db) {
      return false
    }

    const sessionRef = ref(this.db, `sessions/${sessionId}`)
    const snapshot = await get(sessionRef)

    return snapshot.exists()
  }

  async completeSession(sessionId: string, token: TokenData): Promise<void> {
    if (!this.db) {
      return
    }

    const sessionRef = ref(this.db, `sessions/${sessionId}`)

    await set(sessionRef, { status: 'done', ...token })
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) {
      return
    }

    const sessionRef = ref(this.db, `sessions/${sessionId}`)

    await remove(sessionRef)
  }
}
