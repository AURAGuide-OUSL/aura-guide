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

# Whole-word / phrase patterns only - avoids false positives like "lying" in "applying".
ETHICAL_FLAG_PATTERNS = (
    re.compile(r"\blies\b", re.I),
    re.compile(r"\blie\b", re.I),
    re.compile(r"\blied\b", re.I),
    re.compile(r"\blying\b", re.I),
    re.compile(r"\bcheat(?:s|d|ing)?\b", re.I),
    re.compile(r"\bplagiar(?:y|ize|ized|izing|ise|ised|ising)\b", re.I),
    re.compile(r"\bdiscriminat(?:e|es|ed|ing|ion|ory)\b", re.I),
    re.compile(r"\bharass(?:es|ed|ing|ment)?\b", re.I),
    re.compile(r"\bbypass\s+(?:policy|security|rules)\b", re.I),
    re.compile(r"\bdishonest(?:y)?\b", re.I),
    re.compile(r"\bsteal(?:ing|s)?\b", re.I),
    re.compile(r"\bstolen\b", re.I),
    re.compile(r"\btheft\b", re.I),
    re.compile(r"\bfraud(?:ulent)?\b", re.I),
    re.compile(r"\bmisrepresent(?:ed|ing|ation)?\b", re.I),
    re.compile(r"\bdeceiv(?:e|es|ed|ing|ing)?\b", re.I),
    re.compile(r"\bdeception\b", re.I),
    re.compile(r"\bcover[- ]?up\b", re.I),
    re.compile(
        r"\bcompromis(?:e|es|ed|ing)\s+(?:the\s+)?(?:logging|records|audit|integrity)\b",
        re.I,
    ),
    re.compile(
        r"\bskip(?:ping)?\s+(?:maintenance|proper|records|documentation|logging)\b",
        re.I,
    ),
    re.compile(r"\bignore\s+debugging\b", re.I),
)


@dataclass(frozen=True)
class EthicalCheckResult:
    ethical: bool
    message: str


def check_answer_ethics(answer: str) -> EthicalCheckResult:
    text = (answer or "").strip()
    if not text:
        return EthicalCheckResult(True, "")

    for pattern in ETHICAL_FLAG_PATTERNS:
        if pattern.search(text):
            return EthicalCheckResult(False, ETHICAL_FEEDBACK)

    return EthicalCheckResult(True, "")
