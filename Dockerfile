FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

RUN addgroup -S spotitrackgroup && adduser -S spotitrack -G spotitrackgroup

COPY --from=deps /app/dist/spotitrack/ ./

USER spotitrack

EXPOSE 4000

ENV PORT 4000

CMD node server/server.mjs
