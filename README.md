# SineKampus

SineKampus is an Expo/React Native app for discovering campus short films. Its original interface and React Navigation structure are preserved while film metadata is loaded from a read-only Express API backed by PostgreSQL and Prisma.

## Features

- Browse, search, and filter published films by genre, year, and department.
- View film details and preserve favorites locally using the original string film IDs.
- Display the original bundled poster assets, with API poster URLs available to other clients.
- Play supported public Facebook videos through Facebook's official embedded player.
- Return a clear in-app message for missing, private, restricted, or non-embeddable videos.
- No viewer accounts, admin dashboard, public write endpoints, uploads, or video hosting.

## Requirements

- Node.js 22.13 or newer (Expo SDK 58 requirement)
- PostgreSQL 14 or newer, or Docker with Compose
- Expo Go or an Android development build for device testing

## Backend setup

```powershell
cd server
Copy-Item .env.example .env
npm install
docker compose up -d postgres
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

If PostgreSQL is already installed, create a `sinekampus` database and adjust `DATABASE_URL` instead of using Docker. The developer-only, idempotent seed currently imports 17 film records with sequential string IDs.

| Variable | Purpose | Default/example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/sinekampus?schema=public` |
| `PORT` | API port | `4000` |
| `CORS_ORIGIN` | Allowed origin or comma-separated origins | `*` |
| `NODE_ENV` | Runtime environment | `development` |

Public read-only API:

- `GET /api/health`
- `GET /api/films?search=&title=&genre=&department=&year=&page=1&limit=20`
- `GET /api/films/:id`
- `GET /api/genres`
- `GET /api/departments`
- `GET /api/collections`

Film lists return `{ data, pagination }`. Limits are validated from 1–100, and only `PUBLISHED` records are exposed.

## App setup

```powershell
Copy-Item .env.example .env
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` to an address reachable from the target:

- Android emulator: `http://10.0.2.2:4000` (automatic development fallback)
- iOS simulator/web: `http://localhost:4000` (automatic development fallback)
- Physical Android device: `http://<computer-LAN-IP>:4000`
- Production: the deployed HTTPS API URL

The API server must be reachable from a physical device, and both devices must be on the same network. Production Android builds should use HTTPS.

## Developer data workflow

There are deliberately no public write routes. Update `server/prisma/seed.js`, then run `npx prisma db seed` inside `server`. Create schema changes with `npx prisma migrate dev --name <change>` and apply committed migrations with `npx prisma migrate deploy`.

## Verification

```powershell
cd server
npm test
npx prisma validate

cd ..
npx expo lint
npx expo export --platform android
```

Automated API tests cover health, pagination, filter validation, 404 behavior, and safe errors. A live PostgreSQL check requires a running database. Facebook playback must be verified with a public, embeddable Facebook post; Facebook privacy, copyright, and regional restrictions cannot be bypassed.
