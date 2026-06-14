"""Keyword and pattern checks for unethical answers before LLM scoring."""

from __future__ import annotations

import re
from dataclasses import dataclass

ETHICAL_FEEDBACK = (
    "**Ethical consideration:** Your answer describes dishonest or unethical behaviour "
    "(for example cheating, lying, plagiarism, or compromising records or integrity). "
    "In interviews, reflections, and technical tasks, always explain honest approaches "
    "and what you would do differently. Please revise your response with ethical actions "
    "and genuine learning."
)

# Substrings (aligned with Go ethical-validator-module) plus common variants.
ETHICAL_FLAG_TERMS = (
    "lie",
    "lied",
    "lying",
    "cheat",
    "cheating",
    "cheated",
    "plagiar",
    "discriminat",
    "harass",
    "bypass policy",
    "bypass security",
    "dishonest",
    "dishonesty",
    "steal",
    "stolen",
    "theft",
    "fraud",
    "misrepresent",
    "deceive",
    "deception",
    "cover up",
    "cover-up",
    "ignore debugging",
    "skip maintenance",
    "skipping maintenance",
    "compromise the logging",
    "compromise logging",
    "skip proper data",
    "skip proper",
    "skip records",
    "skip documentation",
    "skip logging",
)

ETHICAL_FLAG_PATTERNS = (
    re.compile(r"\blies\b", re.I),
    re.compile(r"\blie\b", re.I),
    re.compile(r"\blied\b", re.I),
    re.compile(r"\blying\b", re.I),
    re.compile(r"\bcheat(?:s|d|ing)?\b", re.I),
    re.compile(r"plagiar", re.I),
    re.compile(r"discriminat", re.I),
    re.compile(r"\bharass", re.I),
    re.compile(r"bypass\s+(?:policy|security|rules)", re.I),
    re.compile(r"\bdishonest", re.I),
    re.compile(r"\bsteal(?:ing|s)?\b", re.I),
    re.compile(r"\bstolen\b", re.I),
    re.compile(r"\btheft\b", re.I),
    re.compile(r"\bfraud", re.I),
    re.compile(r"compromis(?:e|ing)\s+(?:the\s+)?(?:logging|records|audit|integrity)", re.I),
    re.compile(r"skip(?:ping)?\s+(?:maintenance|proper|records|documentation|logging)", re.I),
    re.compile(r"ignore\s+debugging", re.I),
)


@dataclass(frozen=True)
class EthicalCheckResult:
    ethical: bool
    message: str


def check_answer_ethics(answer: str) -> EthicalCheckResult:
    text = (answer or "").strip()
    if not text:
        return EthicalCheckResult(True, "")

    lower = text.lower()
    for term in ETHICAL_FLAG_TERMS:
        if term in lower:
            return EthicalCheckResult(False, ETHICAL_FEEDBACK)

    for pattern in ETHICAL_FLAG_PATTERNS:
        if pattern.search(text):
            return EthicalCheckResult(False, ETHICAL_FEEDBACK)

    return EthicalCheckResult(True, "")
