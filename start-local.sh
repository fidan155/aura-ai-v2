#!/usr/bin/env bash
# Startet die App lokal: Datenbank + Python-Passwort-Checker + Next.js
# Aufruf:  ./start-local.sh
set -e
cd "$(dirname "$0")"

echo "▶ 1/3  Datenbank (Postgres im Docker-Container) starten ..."
if docker start pk-postgres-local >/dev/null 2>&1; then
  echo "   ✓ Postgres läuft (localhost:5432)"
else
  echo "   ! Container 'pk-postgres-local' fehlt – lege ihn einmalig neu an:"
  docker run -d --name pk-postgres-local \
    -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=geheim -e POSTGRES_DB=pk_db \
    -p 5432:5432 postgres:15-alpine >/dev/null
  echo "   ✓ Postgres neu erstellt – lege Tabellen an ..."
  sleep 3
  npx drizzle-kit push --force >/dev/null
fi

echo "▶ 2/3  Python-Passwort-Checker (Port 8001) starten ..."
if lsof -iTCP:8001 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "   ✓ läuft bereits"
else
  ( cd backend-api && .venv/bin/uvicorn main:app --host 127.0.0.1 --port 8001 \
      > /tmp/aura-python.log 2>&1 & )
  echo "   ✓ gestartet (Log: /tmp/aura-python.log)"
fi

echo "▶ 3/3  Next.js starten → http://localhost:3000"
echo "   (Zum Beenden: Strg+C)"
npm run dev
