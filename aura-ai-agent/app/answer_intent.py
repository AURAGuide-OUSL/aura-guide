"""Detect when a learner declines to answer vs attempts a substantive response."""

from __future__ import annotations

import re

# Phrases indicating the user is not attempting an answer (many natural variants).
_DONT_KNOW_PATTERN = re.compile(
    r"(?ix)"
    r"(?:"
    r"^\s*i\s+(?:do\s+not|don't|dont)\s+know\b"
    r"|^\s*i\s+(?:am\s+)?not\s+sure\b"
    r"|^\s*(?:not\s+sure|unsure)\b"
    r"|^\s*no\s+idea\b"
    r"|^\s*i\s+have\s+no\s+(?:idea|clue)\b"
    r"|^\s*(?:can't|cannot)\s+(?:answer|respond|explain)\b"
    r"|^\s*i\s+(?:do\s+not|don't|dont)\s+have\s+(?:an\s+)?answer\b"
    r"|^\s*idk\b"
    r"|\bi\s+(?:do\s+not|don't|dont)\s+know\s+(?:the\s+)?(?:answer|how)\b"
    r"|\b(?:don't|do\s+not)\s+know\s+(?:the\s+)?answer\s+for\b"
    r"|\bno\s+idea\s+(?:how|what|about)\b"
    r"|\b(?:can't|cannot)\s+answer\s+this\b"
    r"|\bi\s+need\s+(?:help|a\s+hint)\b"
    r"|\bplease\s+(?:help|explain)\b"
    r"|\b(?:haven't|have\s+not)\s+learned\s+(?:this|yet)\b"
    r"|\bi'm\s+uncertain\b"
    r"|\bi\s+am\s+uncertain\b"
    r")"
)

_ATTEMPT_MARKERS = re.compile(
    r"(?i)\b("
    r"situation|task|action|result|because|therefore|for example|"
    r"first|then|finally|step\s+\d|approach|solution|implement|debug"
    r")\b"
)

_BUT_ATTEMPT = re.compile(r"(?i)(?:don'?t know|not sure|no idea)\s+but\b")


def is_dont_know_answer(text: str) -> bool:
    """True when the user indicates they cannot answer (not a substantive attempt)."""
    raw = (text or "").strip()
    if not raw:
        return True

    lower = raw.lower()
    words = lower.split()

    if len(words) > 50:
        return False

    if _BUT_ATTEMPT.search(lower):
        return False

    if _ATTEMPT_MARKERS.search(lower) and len(words) > 14:
        return False

    if _DONT_KNOW_PATTERN.search(lower):
        return True

    if len(words) <= 5 and re.fullmatch(r"(?i)(?:skip|pass|next|help|\?+)", raw.strip()):
        return True

    return False
