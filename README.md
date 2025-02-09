# Spotitrack

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.6.

## Environment Variables

```bash
# Use env for docker
spotify_client_id = "To Set"
```

## Run project

```bash
ng serve
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
docker run --name spotitrack -p 4000:4000 spotitrack
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
