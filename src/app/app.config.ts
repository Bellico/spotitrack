import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http'
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser'
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router'
import { routes } from './app.routes'
import { spotifyInterceptor } from './interceptors/spotify.interceptors'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch(), withInterceptors([spotifyInterceptor])),
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
  ],
}
