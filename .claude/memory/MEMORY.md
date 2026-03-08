# Spotitrack — Project Memory

## Key Architecture
- Angular 19, standalone components, SSR via `@angular/ssr`
- TailwindCSS 4, Lucide icons, Firebase Realtime Database (no AngularFire)
- QR login flow: desktop generates QR → phone scans → Firebase relay → desktop receives token

## State Management
- **Angular Signals** everywhere: `signal()`, `computed()`, `effect()` — NO BehaviorSubject/RxJS for state
- `AuthService`: `token = signal<string|null>(...)`, `isAuthenticated = computed(...)`
- `PlayerService`: `currentTrack`, `playlists`, `playlistTracks` — all readonly signals with optimistic updates + rollback

## Important Conventions
- `standalone: true` is the **default** in Angular 19+ — never add it explicitly
- `inject()` function only (no constructor injection)
- `takeUntilDestroyed(destroyRef)` for RxJS in components
- `afterNextRender()` for browser-only init (QR code generation)
- `isPlatformBrowser(PLATFORM_ID)` guard for Firebase/localStorage
- `inject(DOCUMENT)?.defaultView?.localStorage` — SSR-safe localStorage pattern
- All UI labels must be in **English** (enforced in CLAUDE.md)
- 2-space indent, single quotes, no semicolons

## HTTP Interceptor
`src/app/interceptors/spotify.interceptors.ts` — injects `Authorization: Bearer` for `api.spotify.com` requests, catches 401 → clears token + redirects home. SpotifyService methods do NOT set headers.

## Routes
- `/` → LoginComponent (lazy)
- `/callback` → AuthCallbackComponent (lazy)
- `/player` → PlayerComponent (lazy, AuthGuard)
- `/qr-auth?session=<id>` → QrAuthComponent (mobile, lazy)
- `/qr-callback` → QrCallbackComponent (mobile OAuth redirect, lazy)
- `**` → redirectTo: `''`

## Services Key Files
- `src/app/services/auth.service.ts` — signals, localStorage
- `src/app/services/spotify-auth.service.ts` — PKCE OAuth, `login(redirectUri?)`, `exchangeCodeForToken(code, redirectUri?)`
- `src/app/services/spotify.service.ts` — API calls, recursive playlist pagination
- `src/app/services/qr-session.service.ts` — Firebase RTDB relay
- `src/app/services/player.service.ts` — central state + optimistic updates

## ESLint
Comprehensive flat config in `eslint.config.mjs`. Key rules: `padding-line-between-statements`, `curly: all`, `brace-style: 1tbs`, `no-console`, `eqeqeq`, `no-var`, `comma-dangle: always-multiline`.

## Commands
```bash
npm start          # Dev server :4200
npm run lint       # ESLint
npm run test       # Karma + Jasmine + Chrome
npm run build      # Production SSR build
```

## Quality Workflow (ALWAYS RUN AFTER CODE CHANGES)
After every code modification, run these 3 phases automatically:
1. `/code-reviewer` — git diff, remove unused imports, fix Angular convention violations
2. `/fix-lint` — `npm run lint -- --fix`, fix remaining errors manually
3. `/run-tests` — `ng test --watch=false --browsers=ChromeHeadless`, fix failures

Use `/quality-check` to chain all three. Commands are in `.claude/commands/`.

## Token Refresh (added 2026-03-08)
`AuthService` now stores `refresh_token` + `expires_at` in localStorage (`setTokenData()`).
`SpotifyAuthService` has `refreshAccessToken(refreshToken)`.
`AuthGuard` proactively refreshes expired tokens before allowing navigation.
Interceptor retries 401s with a fresh token before redirecting to login.
QR flow passes full token data `{access_token, refresh_token, expires_in}` via Firebase.

## User Preferences
- Communicate concisely
- No emojis unless asked
- English-only UI labels (enforced)
- Prefer signals over RxJS for state
- Optimistic UI updates with rollback pattern
