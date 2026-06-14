import asyncio
import logging

import httpx

from app.settings import settings

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are AURA Guide, a supportive AI career coach for university students in software and IT.
Keep answers concise, practical, and encouraging. Focus on study plans, technical growth, interviews, and habits.
Do not claim to be a licensed therapist or replace professional mental health care."""

FLOW_PROMPTS = {
    "reflection": """
You specialize in reflective learning. Help the student notice evidence of progress, blockers, and one next adjustment.
Ask at most one short follow-up when needed; prefer concrete prompts over lecturing.""",
}


def communication_coach_system_template(user_goal: str, skill_level: str) -> str:
    return f"""You are a Professional Communication Coach;

INPUTS:
USER_GOAL: {user_goal} (logged user's goal from the DB)
SKILL_LEVEL: {skill_level} (logged user's skill levels from the DB)

ROLE:
You run a chat-based coaching session using workplace communication scenarios.

TASK:
- Start and continue a conversation with the user using realistic workplace scenarios
- Based on USER_GOAL, simulate professional situations (bugs, updates, client messages, team communication)
- Ask the user to respond each time
- Keep conversation natural and progressive
- Do NOT evaluate responses
- Do NOT give scores during the scenario
- End only when the user signals they want to stop (they will send exit / quit / stop)

FOCUS:
Use 7Cs principles:
Clear, Concise, Complete, Correct, Considerate, Concrete, Courteous

EXIT RULE (critical):
When the user's message indicates they want to end the session - they say "exit", "quit", or "stop" as the main intent (after trimming punctuation) -
you MUST respond ONLY with this exact single line (nothing else before or after):
Session ended. Good job today!

If they are NOT ending the session, never use that phrase; stay in coaching mode."""

_TIMEOUT = httpx.Timeout(connect=30.0, read=240.0, write=30.0, pool=30.0)


async def chat_completion(messages: list[dict]) -> str:
    """Call Ollama /api/chat (non-streaming)."""
    payload = {
        "model": settings.ollama_model,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        "stream": False,
    }
    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
    msg = data.get("message") or {}
    content = msg.get("content") or data.get("response") or ""
    if not content.strip():
        raise RuntimeError("Empty response from Ollama")
    return content.strip()


async def chat_communication_coach(
    messages: list[dict], user_goal: str, skill_level: str
) -> str:
    """Multi-turn workplace communication scenarios; coach prompt only (no generic AURA system)."""
    system = communication_coach_system_template(user_goal, skill_level)
    payload = {
        "model": settings.ollama_model,
        "messages": [{"role": "system", "content": system}] + messages,
        "stream": False,
    }
    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
    msg = data.get("message") or {}
    content = msg.get("content") or data.get("response") or ""
    if not content.strip():
        raise RuntimeError("Empty response from Ollama")
    return content.strip()


async def chat_completion_with_flow(messages: list[dict], topic_flow: str | None) -> str:
    extra = FLOW_PROMPTS.get((topic_flow or "").strip().lower() or "")
    sys = SYSTEM_PROMPT + (extra if extra else "")
    payload = {
        "model": settings.ollama_model,
        "messages": [{"role": "system", "content": sys}] + messages,
        "stream": False,
    }
    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
    msg = data.get("message") or {}
    content = msg.get("content") or data.get("response") or ""
    if not content.strip():
        raise RuntimeError("Empty response from Ollama")
    return content.strip()


async def structured_completion(
    system_prompt: str, user_prompt: str, *, json_format: bool = False
) -> str:
    """Single-turn completion with retries on transient Ollama/network failures."""
    payload: dict = {
        "model": settings.ollama_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
    }
    if json_format:
        payload["format"] = "json"
    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"

    last: Exception | None = None
    for attempt in range(4):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                r = await client.post(url, json=payload)
                r.raise_for_status()
                data = r.json()
            msg = data.get("message") or {}
            content = msg.get("content") or data.get("response") or ""
            text = content.strip()
            if not text:
                raise RuntimeError("Empty response from Ollama")
            return text
        except (
            httpx.TimeoutException,
            httpx.TransportError,
            httpx.HTTPStatusError,
            RuntimeError,
        ) as e:
            last = e
            if isinstance(e, httpx.HTTPStatusError) and e.response.status_code == 429:
                await asyncio.sleep(2.0 * (attempt + 1))
            else:
                await asyncio.sleep(0.6 * (attempt + 1))
            log.warning("ollama structured_completion attempt %s failed: %s", attempt + 1, e)

    assert last is not None
    raise last
