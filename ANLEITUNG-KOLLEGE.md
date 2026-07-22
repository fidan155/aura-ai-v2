# 🚀 AURA.AI – Einrichtung (für den Kollegen)

Diese Anleitung bringt das Projekt komplett zum Laufen. Du brauchst **nur Docker** –
kein Node, kein Python, keine Datenbank musst du selbst installieren. Docker baut alles.

---

## ✅ Voraussetzung (einmalig)

1. **Docker Desktop** installieren: https://www.docker.com/products/docker-desktop/
2. Docker Desktop **starten** und warten, bis es oben „Running / grün" anzeigt.

Prüfen im Terminal (muss eine Version ausgeben):

```bash
docker --version
docker compose version
```

---

## ▶️ Starten (4 Befehle)

```bash
# 1) In den entpackten Projektordner wechseln
cd ~/Desktop/nextjs-product-challenge

# 2) .env anlegen und POSTGRES_PASSWORD, JWT_SECRET und OPENAI_API_KEY eintragen
#    (OpenAI API Key: https://platform.openai.com/api-keys)
cp .env.example .env

# 3) Alles bauen und starten (erster Start dauert 3–5 Min, danach Sekunden)
docker compose up -d --build

# 4) Status prüfen – alle Container sollen "Up" sein
docker compose ps
```

Wenn alles läuft, **im Browser (Firefox) öffnen:**

- Registrieren: **http://aura.localhost/register**
- Login: **http://aura.localhost/login**
- Datenbank ansehen (Drizzle Studio): **https://local.drizzle.studio**
- Traefik-Dashboard (Routen ansehen): **http://localhost:8080/dashboard/**

> `aura.localhost` funktioniert automatisch (moderne Browser leiten `*.localhost`
> auf 127.0.0.1). Falls es bei dir ausnahmsweise NICHT lädt, einmal ausführen:
> `echo "127.0.0.1 aura.localhost" | sudo tee -a /etc/hosts`

---

## 🧪 Test-Login

Nach der Registrierung eines eigenen Accounts kannst du dich einloggen.
Die Datenbank startet leer – also **erst registrieren**, dann einloggen.

---

## 🗄️ Datenbank ansehen – Drizzle Studio (visuelle Oberfläche)

Drizzle Studio **startet automatisch mit** `docker compose up`. Du musst nichts extra tun –
einfach im Browser öffnen:

### 👉 https://local.drizzle.studio

Dort siehst du die Tabellen **`users`**, **`adressen`** und **`antraege`** mit allen Daten
und kannst Einträge sogar direkt bearbeiten oder löschen.

> `local.drizzle.studio` ist die offizielle Drizzle-Oberfläche. Sie läuft im Browser,
> verbindet sich aber nur mit dem Studio-Dienst auf **deinem** Rechner (Port 4983) –
> deine Daten verlassen den Rechner nicht.
>
> Falls die Seite „kann nicht verbinden" zeigt: kurz warten, bis der Container `aura-studio`
> oben ist (`docker compose ps`), dann Seite neu laden.

### Alternative: schnell per SQL im Terminal

```bash
docker compose exec postgres psql -U postgres -d pk_db
# Beispiele:
#   SELECT * FROM users;
#   SELECT * FROM antraege;
# Beenden mit:  \q
```

---

## ⏹ Stoppen / Neustarten

```bash
docker compose down            # stoppen
docker compose up -d           # wieder starten (ohne neu bauen)
docker compose up -d --build   # nach Code-Änderungen neu bauen
docker compose logs -f frontend  # Logs live ansehen
```

---

## ❓ Was war vorher das Problem? (warum lief es bei dir nicht)

1. **Login rief die falsche URL auf:** `src/app/login/page.tsx` schickte den Login an
   `/api-python/login` – die gibt es nicht. Der Login läuft über die Next.js-Route
   `/api/login` (bcrypt + JWT). → gefixt.
2. **Keine `.env`:** Die Datei ist in `.gitignore`, kam also nie per Git an.
   Ohne `DATABASE_URL` / `JWT_SECRET` / `OPENAI_API_KEY` scheitern Login,
   Registrierung bzw. die KI-Analyse. → `docker-compose.yml` baut `DATABASE_URL`
   selbst zusammen, `POSTGRES_PASSWORD` / `JWT_SECRET` / `OPENAI_API_KEY`
   müssen aber in der `.env` gesetzt sein (siehe `.env.example`).
3. **Python-Service crashte auf Python < 3.10** (`str | None` in `main.py`).
   → mit `from __future__ import annotations` versionsunabhängig gemacht.
4. **Datenbank-Tabellen fehlten.** → Werden jetzt beim Start automatisch angelegt
   (`drizzle-kit push` im Startbefehl des Frontends).
5. **`127.0.0.1:8000` im Container** funktioniert nicht → jetzt über den Docker-Servicenamen
   (`PYTHON_API_URL=http://backend:8000`).

Alle diese Fixes sind in diesem ZIP bereits enthalten – einfach starten.

---

## 🖥️ Alternative: lokal ohne Docker (optional)

Falls du es doch ohne Docker willst, brauchst du Node 20+, Python 3.11+ und eine
Postgres-DB. Dann:

```bash
npm install
python3 -m venv backend-api/.venv
backend-api/.venv/bin/pip install -r backend-api/requirements.txt
# .env anlegen (siehe beiliegende .env), DB starten, dann:
npx drizzle-kit push
export OPENAI_API_KEY=sk-...                          # im Ordner backend-api, vor uvicorn
backend-api/.venv/bin/uvicorn main:app --port 8001   # im Ordner backend-api
npm run dev                                           # im Projekt-Root
```

Öffnen dann unter http://localhost:3000 (ohne Traefik/Subdomain).
