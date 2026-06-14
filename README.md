# AURA Guide

AURA Guide is an AI-driven career coach for undergraduate Software Engineering, Computer Science, and IT students. The stack:

| Component | Role |
|-----------|------|
| **`aura-backend`** | Go REST API — auth, tasks, profile, PostgreSQL |
| **`aura-ai-agent`** | Python FastAPI + Ollama — AI Coach, CV analysis, interviews |
| **`aura-ui`** | Expo React Native — web, Expo Go, or standalone APK |

---

## Architecture (mobile / APK)

The mobile app **does not connect to PostgreSQL directly**. All data flows through your dev machine on the LAN:

```
Phone (APK / Expo Go)
    │  HTTP  :8080  (REST + JWT)
    ▼
Go backend  ──►  PostgreSQL (localhost on your laptop)
    │
    │  HTTP  :8001  (AI routes, same JWT)
    ▼
AI agent  ──►  PostgreSQL + Ollama (localhost)
```

Both backends must listen on **`0.0.0.0`** so the phone can reach them over Wi‑Fi. The database stays on the host machine only.

---

## Prerequisites

- **PostgreSQL** — create database `aura` and apply `aura-backend/schema.sql`
- **Go 1.21+**
- **Python 3.10+**
- **Node.js 18+**
- **[Ollama](https://ollama.com/)** — `ollama pull llama3.2:1b`
- **Expo / EAS CLI** (for mobile builds) — `npm install -g eas-cli`

---

## 1. Start the Go backend

```bash
cd aura-backend

export DATABASE_URL="postgres://username:password@localhost:5432/aura"
export JWT_SECRET="your_secure_secret_key"
# Optional: when Go proxies CV to the agent
export AI_AGENT_URL="http://127.0.0.1:8001"

go mod tidy
go run main.go
```

- Listens on **`http://0.0.0.0:8080`** (all interfaces).
- Migrations and seed data run automatically on startup (best-effort).
- Native mobile apps use **Bearer JWT** in `Authorization` headers (no browser cookies).

---

## 2. Start the AI agent

```bash
cd aura-ai-agent

python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # edit DATABASE_URL + JWT_SECRET to match Go
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

- Default port is **8001** (matches the mobile app and Go `AI_AGENT_URL`).
- `JWT_SECRET` and `DATABASE_URL` **must match** the Go backend.
- Health check: `GET http://localhost:8001/health`

---

## 3. Configure API URLs for the frontend

All service URLs are set via environment variables (not hardcoded in source).

```bash
cd aura-ui
cp .env.example .env
```

Edit `.env` — replace `192.168.8.105` with **your laptop's LAN IP**:

```bash
# Find LAN IP (Linux/macOS):
hostname -I | awk '{print $1}'

EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:8080
EXPO_PUBLIC_AI_AGENT_BASE_URL=http://YOUR_LAN_IP:8001
```

| Target | URL pattern |
|--------|-------------|
| Web browser (`npm run web`) | `http://localhost:8080` / `:8001` (defaults if `.env` unset) |
| Android emulator | `http://10.0.2.2:8080` / `:8001` (defaults if `.env` unset) |
| Physical phone / APK | **Must set `.env`** with your LAN IP |

Phone and laptop must be on the **same Wi‑Fi**. Allow ports **8080** and **8001** through your firewall if needed.

---

## 4. Run the frontend

```bash
cd aura-ui
npm install
```

### Web

```bash
npm run web
```

### Expo Go (development on a physical phone)

```bash
npm start
```

Scan the QR code with Expo Go. Ensure `.env` has your LAN IP.

### Android emulator

```bash
npm run android
```

Uses `10.0.2.2` automatically when `.env` is not set.

---

## 5. Build a standalone APK (EAS)

The app uses **EAS Build** (cloud) with the `preview` profile, which outputs an installable **`.apk`**.

### One-time setup

```bash
npm install -g eas-cli
eas login
cd aura-ui
eas init          # link Expo project if prompted
```

### Before each APK build

1. Update **`aura-ui/.env`** with your LAN IP (for local dev consistency).
2. Update **`aura-ui/eas.json`** → `build.preview.env` with the **same** URLs (EAS cloud builds bake these in):

```json
"env": {
  "EXPO_PUBLIC_API_BASE_URL": "http://YOUR_LAN_IP:8080",
  "EXPO_PUBLIC_AI_AGENT_BASE_URL": "http://YOUR_LAN_IP:8001"
}
```

3. Ensure Go backend, AI agent, PostgreSQL, and Ollama are running on your laptop when you **use** the APK.

### Build

```bash
cd aura-ui
npm run build:apk
# equivalent: eas build -p android --profile preview
```

When the cloud build finishes, download the APK from the link in the terminal and install it on your phone.

### Android HTTP (cleartext)

Local/LAN backends use HTTP. `app.config.ts` sets `android.usesCleartextTraffic: true` so the APK can call `http://192.168.x.x` endpoints. For production deployments, use HTTPS instead.

---

## Troubleshooting (mobile / APK)

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Login or API fails on phone | Wrong IP in `.env` / `eas.json` | Update LAN IP; rebuild APK if using EAS |
| AI Coach / CV upload fails | Agent not on **8001** or not on `0.0.0.0` | Run uvicorn with `--host 0.0.0.0 --port 8001` |
| "Network request failed" on APK | Cleartext blocked or firewall | Confirm `usesCleartextTraffic`; open ports 8080/8001 |
| Agent auth errors | JWT mismatch | Same `JWT_SECRET` in Go and agent `.env` |
| Empty tasks / skills | DB not seeded | Restart Go backend; check PostgreSQL connection |
| Android emulator can't reach API | Using `localhost` instead of `10.0.2.2` | Remove `.env` for emulator defaults, or set `10.0.2.2` |

---

## Port reference

| Service | Port | Env / config |
|---------|------|--------------|
| Go backend | **8080** | `PORT` (default 8080) |
| AI agent | **8001** | `PORT` in agent `.env` or `--port 8001` |
| Ollama | **11434** | `OLLAMA_BASE_URL` |
| PostgreSQL | **5432** | `DATABASE_URL` (server-side only) |
| Expo dev server | **8081** | automatic |

---

## Project layout

```
aura-guide/
├── aura-backend/       Go API + PostgreSQL access
├── aura-ai-agent/      FastAPI + Ollama agent
├── aura-ui/            Expo React Native app
│   ├── app.config.ts   Expo config (cleartext HTTP, env URLs)
│   ├── eas.json        EAS build profiles (preview → APK)
│   ├── .env.example    Copy to .env for API URLs
│   └── src/config.ts   Reads EXPO_PUBLIC_* at runtime
└── README.md           This file
```

See also:

- [`aura-backend/README.md`](aura-backend/README.md) — API examples
- [`aura-ai-agent/README.md`](aura-ai-agent/README.md) — agent endpoints
- [`aura-ui/README.md`](aura-ui/README.md) — frontend dev commands
