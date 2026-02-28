# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spotitrack is a Spotify playlist manager built with Angular 19, featuring OAuth2 PKCE authentication, real-time track monitoring (10s polling), and playlist management. It supports SSR via `@angular/ssr` and is containerized with Docker.

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

**Service layer:**
- `SpotifyAuthService` — OAuth2 Authorization Code + PKCE flow. Generates code verifier/challenge, exchanges authorization code for tokens.
- `AuthService` — Token management via BehaviorSubject + localStorage. Exposes `isAuthenticated()` and `getToken()` as Observables.
- `SpotifyService` — Spotify Web API calls (current track, playlists, add/remove tracks). Uses recursive pagination for track fetching (100 per request).
- `PlayerService` — Central state via Angular Signals (`currentTrack`, `playlists`, `playlistTracks`). Performs optimistic UI updates on playlist operations.

**Playlist filtering** (`helpers/playlist.helper.ts`): Filters and sorts user playlists by hardcoded French names ("Sélection", "Trap", "Rap") and by proximity to the current year.

**HTTP interceptor** (`interceptors/spotify.interceptor.ts`): Catches 401 responses, clears the token, and redirects to home.

## Conventions

- **Standalone components** — no NgModules. All components use `standalone: true`.
- **`inject()` function** for dependency injection (not constructor-based).
- **Angular Signals** for component/service state; RxJS for async streams and HTTP.
- **New control flow syntax** — `@if`, `@for` (not `*ngIf`, `*ngFor`).
- **Functional guards and interceptors** (`CanActivateFn`, `HttpInterceptorFn`).
- **Style:** 2-space indent, single quotes, no semicolons (enforced by ESLint).
- **TailwindCSS 4** for styling with a Spotify-themed dark color palette.
- **Environment config** in `src/environments/` — requires `spotify_client_id`.
