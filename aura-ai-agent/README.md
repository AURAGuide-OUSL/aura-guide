# AURA AI Agent (FastAPI + Ollama)

Python service that forwards chat to a local [Ollama](https://ollama.com) model and persists sessions in PostgreSQL (`chat_sessions`, `chat_message`), using the same JWT as the Go API (`sub` = user email).

## Prerequisites

- PostgreSQL with schema applied (see `aura-backend/schema.sql`).
- Ollama installed; model pulled once: `ollama pull llama3.2:1b`
- The Ollama HTTP server reachable at `OLLAMA_BASE_URL` (default `http://127.0.0.1:11434`). You do **not** need `ollama run …` for the app-that opens an interactive CLI; the agent uses the API only.

## Configuration

Copy `.env.example` to `.env` or set env vars:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Same connection string as the Go backend (e.g. `postgres://…/aura`). |
| `JWT_SECRET` | Must match Go `JWT_SECRET` / signing key so Bearer tokens validate. |
| `OLLAMA_BASE_URL` | Default `http://127.0.0.1:11434`. |
| `OLLAMA_MODEL` | Default `llama3.2:1b`. |
| `CORS_ORIGINS` | Comma-separated origins for the Expo web/dev server (e.g. `http://localhost:8081`). |
| `PORT` | Default `8001` (must match `EXPO_PUBLIC_AI_AGENT_BASE_URL` in the mobile app). |

## Run

```bash
cd aura-ai-agent
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Health check: `GET http://localhost:8001/health`

## API (requires `Authorization: Bearer <jwt>`)

- `POST /agent/chat` - body: `{ "message", "session_id"?, "topic_flow"?: "reflection" | "communication" }`
- `GET /agent/chat/history` - optional `?session_id=`
- `POST /agent/chat/new-session` - start a fresh chat session row
- `POST /agent/cv-analyze` - body: `{ "cv_text", "file_name" }` → upserts `user_cv_analysis` (also used by Go after PDF extraction)
- `POST /agent/interview/next-question` - `{ "question_number" }`
- `POST /agent/interview/evaluate` - `{ "question_number", "question", "answer" }` → updates **Behavioral Interview Skills** in `user_skills`
- `POST /agent/task/generate` - inserts `common_tasks` + `user_common_tasks`
- `POST /agent/task/evaluate` - `{ "user_common_task_id", "task_description", "skill", "answer" }` → updates technical skill scores

The Expo app reads `CONFIG.AI_AGENT_BASE_URL` from `aura-ui/.env` (`EXPO_PUBLIC_AI_AGENT_BASE_URL`). The Go backend uses `AI_AGENT_URL` when proxying CV upload (default `http://127.0.0.1:8001`).

Use your LAN IP on port **8001** when testing on a physical device or in a standalone APK.
