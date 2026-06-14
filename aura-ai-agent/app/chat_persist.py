"""Helpers for appending AI Coach traffic to chat_sessions / chat_message."""

from __future__ import annotations

from datetime import datetime, timezone


CHAT_OLLAMA_HISTORY_LIMIT = 20


def fetch_recent_chat_rows(conn, session_id: int, limit: int = CHAT_OLLAMA_HISTORY_LIMIT):
    rows = conn.execute(
        """SELECT message, is_sender_user FROM chat_message
           WHERE session_id = %s ORDER BY id DESC LIMIT %s""",
        (session_id, limit),
    ).fetchall()
    return list(reversed(rows))


def fetch_all_chat_rows(conn, session_id: int):
    return conn.execute(
        """SELECT message, is_sender_user FROM chat_message
           WHERE session_id = %s ORDER BY id ASC""",
        (session_id,),
    ).fetchall()


def append_message(conn, session_id: int, message: str, is_sender_user: bool) -> None:
    text = (message or "").strip()
    if not text:
        return
    conn.execute(
        """INSERT INTO chat_message (session_id, message, is_sender_user)
           VALUES (%s, %s, %s)""",
        (session_id, text[:16000], is_sender_user),
    )


def latest_session_id(conn, user_id: int) -> int | None:
    row = conn.execute(
        """SELECT id FROM chat_sessions WHERE user_id = %s
           ORDER BY start_date_time DESC NULLS LAST, id DESC LIMIT 1""",
        (user_id,),
    ).fetchone()
    return int(row["id"]) if row else None


def create_session(conn, user_id: int, topic: str) -> int:
    row = conn.execute(
        """INSERT INTO chat_sessions (user_id, topic, start_date_time)
           VALUES (%s, %s, %s) RETURNING id""",
        (user_id, topic[:255], datetime.now(timezone.utc)),
    ).fetchone()
    return int(row["id"])


def resolve_session_id(conn, user_id: int, session_id: int | None, *, topic: str) -> int:
    """Use an existing owned session when session_id is set; otherwise reuse latest or create."""
    if session_id is not None:
        row = conn.execute(
            "SELECT id FROM chat_sessions WHERE id = %s AND user_id = %s",
            (session_id, user_id),
        ).fetchone()
        if not row:
            raise ValueError("session not found")
        return int(row["id"])
    sid = latest_session_id(conn, user_id)
    if sid is not None:
        return sid
    return create_session(conn, user_id, topic)
