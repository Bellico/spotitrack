import { isPlatformBrowser } from '@angular/common'
import { inject, Injectable, PLATFORM_ID } from '@angular/core'
import { initializeApp } from 'firebase/app'
import { Database, get, getDatabase, onValue, ref, remove, set } from 'firebase/database'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

interface QrSession {
  status: 'pending' | 'done'
  token?: string
  createdAt?: number
}

@Injectable({
  providedIn: 'root',
})
export class QrSessionService {
  private platformId = inject(PLATFORM_ID)
  private db: Database | null = null

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const app = initializeApp(environment.firebase)
      this.db = getDatabase(app)
    }
  }

  createSession(): string {
    const sessionId = crypto.randomUUID()
    if (this.db) {
      const sessionRef = ref(this.db, `sessions/${sessionId}`)
      set(sessionRef, { status: 'pending', createdAt: Date.now() } satisfies QrSession)
    }
    return sessionId
  }

  listenSession(sessionId: string): Observable<string> {
    return new Observable((subscriber) => {
      if (!this.db) return
      const sessionRef = ref(this.db, `sessions/${sessionId}`)
      const unsubscribe = onValue(sessionRef, (snapshot) => {
        const data = snapshot.val() as QrSession | null
        if (data?.status === 'done' && data.token) {
          subscriber.next(data.token)
          subscriber.complete()
        }
      })
      return () => unsubscribe()
    })
  }

  async sessionExists(sessionId: string): Promise<boolean> {
    if (!this.db) return false
    const sessionRef = ref(this.db, `sessions/${sessionId}`)
    const snapshot = await get(sessionRef)
    return snapshot.exists()
  }

  async completeSession(sessionId: string, token: string): Promise<void> {
    if (!this.db) return
    const sessionRef = ref(this.db, `sessions/${sessionId}`)
    await set(sessionRef, { status: 'done', token } satisfies QrSession)
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) return
    const sessionRef = ref(this.db, `sessions/${sessionId}`)
    await remove(sessionRef)
  }
}
