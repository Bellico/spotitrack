# Spotitrack

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.6.

## Environment Variables

### Add environment.ts
```ts
export const environment = {
  spotify_api_url: 'https://api.spotify.com/v1',
  spotify_client_id: '$SPOTIFY_CLIENT_ID',
  firebase: {
    apiKey: '$FIREBASE_API_KEY',
    databaseURL: '$FIREBASE_DATABASE_URL',
    projectId: '$FIREBASE_PROJECT_ID',
  },
}

```

## Run project

```bash
ng serve
ng serve --disable-host-check (ngrok)
ngrok http 4200
```

## Building

To build the project run:

```bash
ng build
node .\dist\spotitrack\server\server.mjs
```

## Build from Dockerfile

```bash
docker build -t bellico/spotitrack:latest .
docker run --name spotitrack -p 4000:4000 bellico/spotitrack
# docker push bellico/spotitrack:latest
```

## Running unit tests

```bash
ng test
```

## Running end-to-end tests

```bash
ng e2e
```
## Code scaffolding

```bash
ng generate component component-name
ng generate --help
```
