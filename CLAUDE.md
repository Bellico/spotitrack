# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spotitrack is a Spotify playlist manager built with Angular 19, featuring OAuth2 PKCE authentication, real-time track monitoring (10s polling), QR code login via Firebase Realtime Database, and playlist management. It supports SSR via `@angular/ssr` and is containerized with Docker.

## Commands

```bash
npm start          # Dev server on port 4200
npm run build      # Production build with SSR
npm run test       # Unit tests (Karma + Jasmine + Chrome)
npm run lint       # ESLint (src/**)
npm run ssr        # Run SSR server on port 4000 (requires build first)
```

Docker:
```bash
docker build -t bellico/spotitrack:latest .
docker run --name spotitrack -p 4000:4000 spotitrack
```

## Architecture

**Routes:** `/` (Login) → `/callback` (OAuth redirect) → `/player` (main app, guarded by AuthGuard)
**QR flow:** `/qr-auth?session=<id>` (mobile) → `/qr-callback` (OAuth redirect mobile)

All routes use **lazy loading** via `loadComponent`.

**Service layer:**
- `SpotifyAuthService` — OAuth2 Authorization Code + PKCE flow. `login(redirectUri?)` returns the auth URL. `exchangeCodeForToken(code, redirectUri?)` exchanges for tokens.
- `AuthService` — Token management via **signal** + localStorage. `token` (signal), `isAuthenticated` (computed). No more BehaviorSubject/RxJS.
- `SpotifyService` — Spotify Web API calls (current track, playlists, add/remove tracks). Uses recursive pagination for track fetching (100 per request). **No Authorization headers** — injected by interceptor.
- `PlayerService` — Central state via Angular Signals (`currentTrack`, `playlists`, `playlistTracks`). Performs optimistic UI updates on playlist operations.
- `QrSessionService` — Firebase Realtime Database relay for QR login. SSR-safe (all Firebase ops gated with `isPlatformBrowser`).

**HTTP interceptor** (`interceptors/spotify.interceptors.ts`): Injects `Authorization: Bearer <token>` header on all `api.spotify.com` requests. Catches 401 responses, clears the token, and redirects to home.

**Playlist filtering** (`helpers/playlist.helper.ts`): Filters and sorts user playlists by hardcoded French names ("Sélection", "Trap", "Rap") and by proximity to the current year.

## Language

- **All UI labels, messages, and template text must be in English.** (buttons, error messages, status text, placeholders, etc.)

## Conventions

- **Standalone components** — no NgModules. All components use `standalone: true`.
- **`inject()` function** for dependency injection (not constructor-based).
- **Angular Signals** for all state — `signal()`, `computed()`. No BehaviorSubject.
- **`effect()`** in constructors for reactive side-effects (e.g. redirect on auth change).
- **`takeUntilDestroyed(destroyRef)`** for RxJS subscriptions in components (no manual unsubscribe/OnDestroy).
- **`afterNextRender()`** for browser-only initialization (avoids SSR issues).
- **`isPlatformBrowser(PLATFORM_ID)`** guard in constructors for Firebase/localStorage access.
- **RxJS** only for async streams (HTTP, Firebase `onValue`). Not for state.
- **New control flow syntax** — `@if`, `@for`, `@let` (not `*ngIf`, `*ngFor`).
- **Functional guards and interceptors** (`CanActivateFn`, `HttpInterceptorFn`).
- **Lazy loading** — all routes use `loadComponent` for code splitting.
- **Style:** 2-space indent, single quotes, no semicolons (enforced by ESLint).
- **TailwindCSS 4** for styling with a Spotify-themed dark color palette.
- **Environment config** in `src/environments/environment.ts` — `spotify_client_id` and `firebase` config.

## Quality Workflow (MANDATORY)

After **every code modification**, automatically run these three phases in order — no exceptions:

1. **`/code-reviewer`** — review changed files (`git diff HEAD --name-only`), remove unused imports/variables, fix convention violations, simplify over-engineered code
2. **`/fix-lint`** — run `npm run lint -- --fix`, then manually fix any remaining ESLint errors, confirm zero errors
3. **`/run-tests`** — run `ng test --watch=false --browsers=ChromeHeadless`, fix any failing tests, confirm all pass

Use `/quality-check` to run all three phases at once. These phases can also be invoked individually.

## SSR Considerations

- Firebase SDK must be initialized inside `isPlatformBrowser` guards — it uses browser APIs.
- `localStorage` access must be guarded similarly.
- `afterNextRender` ensures QR code generation runs browser-side only.
- `inject(DOCUMENT)?.defaultView?.localStorage` is the SSR-safe pattern for localStorage.
