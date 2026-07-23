# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project overview

"Aura.AI" — a Next.js (App Router) frontend with a separate FastAPI Python microservice, Postgres via Drizzle ORM, JWT/bcrypt auth, and the OpenAI API (`gpt-4o-mini`) used for AI-generated user-engagement summaries. Much of the code (UI copy, identifiers like `Anträge`, `Adressen`, `Strasse`/`Plz`/`Stadt`, `beschreibung`) is German — match that when touching those areas.

## Commands

- `npm run dev` — start Next.js dev server (localhost:3000)
- `npm run build` / `npm run start` — production build / start
- `npm run lint` — ESLint (`eslint-config-next`, flat config in `eslint.config.mjs`)
- `npm run format` — Prettier over `src/**/*.{js,jsx,ts,tsx,css,json}`
- `npx drizzle-kit push --force` — apply `src/db/schema.ts` straight to Postgres (no generated SQL migrations are used — this repo pushes schema directly rather than running `drizzle-kit generate`/`migrate`)
- `npx drizzle-kit studio` — visual DB browser at https://local.drizzle.studio
- No test suite/framework is configured in this repo (no `test` script, no Jest/Vitest config).
- Husky `pre-commit` hook runs `npx lint-staged` (ESLint `--fix` + Prettier on staged files).

### Running the full stack

- **Docker (primary path, see `ANLEITUNG-KOLLEGE.md`)**: `docker compose up -d --build`, then `docker compose ps` / `docker compose logs -f frontend` / `docker compose down`. Everything (Postgres, Traefik, the Python service, Drizzle Studio) is provisioned by `docker-compose.yml`; the frontend container runs `npx drizzle-kit push --force && npm run start` on boot, so schema changes just need a rebuild/restart. App is served at `http://aura.localhost` (via Traefik on :80). The `backend` service requires `OPENAI_API_KEY` in `.env`.
- **Without Docker**: `./start-local.sh` starts a standalone `pk-postgres-local` container, runs the Python API with uvicorn, then `npm run dev`. Note: this script runs the Python service on port **8001**, while the Next.js route handlers' hardcoded fallback (`PYTHON_API_URL` unset) points at port **8000** — set `PYTHON_API_URL` in `.env` when running this way.
- **Python service directly**: from `backend-api/`, `uvicorn main:app --port 8001` (needs `backend-api/requirements.txt` installed, e.g. into a venv).

## Architecture

- `src/proxy.ts` — edge proxy (formerly `middleware.ts`) guarding `/admin` and `/dashboard`. Reads the `auth_token` JWT cookie (verified with `jose`/`JWT_SECRET`), redirects unauthenticated users to `/login`, redirects users to the route matching their `role` (`admin` → `/admin`, otherwise `/dashboard`), and blocks `/login`/`/register` for already-authenticated users.
- `src/db/schema.ts` — Drizzle schema, three tables: `users` (includes engagement-tracking columns `lastLogin`, `loginCount`, `featureClicks`, plus `role`), `adressen` (1:1 with `users` via `userId` FK, cascade delete), `antraege` (standalone, no FK to `users`).
- `src/db/index.ts` — `postgres-js` + Drizzle client, reads `DATABASE_URL`.
- `src/app/api/*` route handlers:
  - `login/route.ts` — verifies bcrypt password, bumps `lastLogin`/`loginCount`, issues a 1-day JWT in an httpOnly `auth_token` cookie (`secure` gated on `COOKIE_SECURE` env var since local Docker runs over plain HTTP behind Traefik).
  - `register/route.ts` — creates a `users` row + linked `adressen` row in one request.
  - `auth/logout/route.ts` — clears the cookie.
  - `check-password/route.ts` — proxies to the Python service's `/api/check-password` (zxcvbn strength check).
  - `antraege/route.ts` — CRUD for `antraege`; `POST` also decodes the caller's JWT to increment their `featureClicks`.
  - `admin/user-analyse/route.ts` — loads all users, then calls the Python service's `/api/analyze-user` for each in batches of `CONCURRENCY = 4` to stay within OpenAI API rate limits; on a failed/timed-out call (15s `AbortSignal.timeout`) it falls back to a per-user `kiStatus: 'Error'` entry rather than failing the whole page.
- `backend-api/main.py` — FastAPI microservice, two endpoints:
  - `POST /api/check-password` — `zxcvbn`-based strength scoring.
  - `POST /api/analyze-user` — status (`Active`/`At Risk`/`Inactive`) is computed deterministically in `classify_status()` (not by the LLM); the OpenAI API (`gpt-4o-mini`, via the `openai` SDK, `OPENAI_API_KEY` from env) is only used to generate the `summary`/`recommendation` text (structured JSON output via `response_format` json_schema), with a 30-minute in-memory cache (`_analysis_cache`, keyed/rounded via `_cache_key`) and a hardcoded rule-based fallback text per status if the LLM call fails.
- Service names inside Docker: the frontend talks to the Python service directly via `PYTHON_API_URL=http://backend:8000` (the Docker Compose service name). Traefik also exposes the backend at `aura.localhost/api-python/*`, but that route isn't used by the current Next.js code paths.

## Conventions

- Path alias `@/*` → `./src/*` (see `tsconfig.json`).
- UI components: shadcn (`components.json`, style `radix-nova`, base color `neutral`) generating into `src/components/ui`, built on `radix-ui` primitives, `lucide-react` icons, `class-variance-authority` + `tailwind-merge`/`clsx` (see `cn()` in `src/lib/utils.ts`), Tailwind v4, `framer-motion` for animation.
- Prettier: single quotes, semicolons, 2-space indent, ES5 trailing commas (`.prettierrc`).
