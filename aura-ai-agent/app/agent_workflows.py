from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from psycopg.types.json import Json

from app.db import get_conn
from app.json_utils import (
    as_str_list,
    clean_coach_display_text,
    clean_coach_question_text,
    extract_cv_analysis_object,
    extract_json_object,
)
from app.answer_intent import is_dont_know_answer
from app.ethical_validation import check_answer_ethics
from app.ollama_client import structured_completion
from app.skills_repo import skill_id, status_id_by_name, upsert_user_skill_score

TECH_SKILLS = [
    "Code Understanding",
    "Debugging Reasoning",
    "Algorithmic Thinking",
    "Git Concept Knowledge",
]
INTERVIEW_SKILL = "Behavioral Interview Skills"
PROFESSIONAL_COMMUNICATION_SKILL = "Professional Communication"
REFLECTION_SKILL = "Reflection and Self Assessment"

REFLECTION_QUESTION_FALLBACKS = [
    "What skill or habit have you strengthened most in the past two weeks-and what evidence do you have?",
    "Which blocker slowed you down recently, and what will you adjust next week?",
    "Describe one deliverable you're proud of. What would you do differently with more time?",
    "Where did collaboration go well-or poorly-in your last teamwork experience?",
]

BEHAVIORAL_QUESTION_FALLBACKS = [
    "Describe a workplace situation where priorities changed quickly. What did you communicate, and how did it turn out?",
    "Tell me about a disagreement with a teammate on a technical approach. What was your position, how did you move forward?",
    "Share a mistake you shipped or almost shipped. What did you notice, fix, and change afterward?",
    "Give an example where you coordinated with another team across different working styles.",
    "When have you disagreed respectfully with a lead or stakeholder? Walk through Situation → Task → Action → Result briefly.",
]


_EVAL_FEEDBACK_RULES = """
FEEDBACK RULES (IMPORTANT):
- The user submitted a substantive attempt. Do NOT treat it as "I don't know."
- Score 3: feedback MUST clearly say the answer is strong/good/excellent and cite specific strengths.
- Score 2: acknowledge what is correct or useful first, then give focused improvements. Do not call detailed answers "vague."
- Score 1: explain what is wrong or missing. Use "vague" ONLY if they gave almost no concrete detail despite attempting.
- Never give generic vague criticism when the user provided specific examples, steps, or reasoning.
"""


async def _coach_dont_know_interview(question: str) -> str:
    system = """You are a supportive behavioral interview coach."""
    user = f"""INTERVIEW QUESTION:
{question}

The candidate honestly said they do not know how to answer (or could not answer).

Write plain-text feedback (NOT JSON):
1. One warm sentence: it is okay not to know yet - honesty is fine.
2. A concise STAR-style model answer they can learn from (Situation, Task, Action, Result).
3. One short tip for tackling similar questions next time.

Do NOT criticize them as vague. Do NOT say they failed to provide a solution. Max 220 words."""

    try:
        raw = await structured_completion(system, user)
        text = clean_coach_display_text(raw)
        if text:
            return text
    except Exception:
        pass
    return (
        "That's completely okay - not knowing yet is part of learning. "
        "For this type of question, use STAR: describe a real Situation, your Task, "
        "the Actions you took, and the Result with measurable impact. "
        "Try drafting one example from school, work, or a project, even if small. "
        "Practising aloud will make the structure feel natural next time."
    )


async def _coach_dont_know_task(task_description: str, skill_name: str) -> str:
    system = """You are a supportive technical skills coach."""
    user = f"""TASK:
{task_description}

SKILL BEING ASSESSED: {skill_name}

The learner honestly said they do not know the answer.

Write plain-text feedback (NOT JSON):
1. One warm sentence: it is okay not to know yet.
2. Explain the correct approach or model answer clearly so they can learn.
3. One actionable study tip tied to {skill_name}.

Do NOT criticize them as vague or incomplete for not knowing. Max 220 words."""

    try:
        raw = await structured_completion(system, user)
        text = clean_coach_display_text(raw)
        if text:
            return text
    except Exception:
        pass
    return (
        "That's fine - it's okay not to have this ready yet. "
        f"Review the core ideas for **{skill_name}**, then walk through the task step by step "
        "with a simple example. Try again when ready; learning the model answer first is a good strategy."
    )


def fetch_user_learning_row(email: str) -> dict[str, Any]:
    with get_conn() as conn:
        row = conn.execute(
            """
SELECT u.id AS user_id,
       COALESCE(g.name, 'Unknown') AS goal_name,
       COALESCE(u.technical_skill_level::text, '') AS technical_skill_level,
       COALESCE(u.soft_skill_level::text, '') AS soft_skill_level,
       COALESCE(u.availability_type::text, '') AS availability_type,
       COALESCE(u.availability_hours::text, '') AS availability_hours
FROM user_student u
LEFT JOIN goals g ON g.id = u.goal_id
WHERE lower(trim(u.email)) = lower(trim(%s))
""",
            (email,),
        ).fetchone()
    if not row:
        raise ValueError("user not found")
    return dict(row)


def recent_skills_summary(user_id: int) -> str:
    parts: list[str] = []
    with get_conn() as conn:
        rows = conn.execute(
            """
SELECT s.name AS skill_name, MAX(COALESCE(ucm.start_date_time, ucm.end_date_time)) AS last_ts
FROM user_common_tasks ucm
JOIN common_tasks ct ON ct.id = ucm.common_task_id
JOIN skills s ON s.id = ct.skill_id
WHERE ucm.user_id = %s AND s.name = ANY(%s)
GROUP BY s.name
ORDER BY last_ts DESC NULLS LAST
LIMIT 8
""",
            (user_id, TECH_SKILLS),
        ).fetchall()
        for r in rows:
            parts.append(f"{r['skill_name']} (agent common task)")
        rows2 = conn.execute(
            """
SELECT s.name AS skill_name, MAX(COALESCE(uct.start_date_time, uct.end_date_time)) AS last_ts
FROM user_custom_tasks uct
JOIN skills s ON s.id = uct.skill_id
WHERE uct.user_id = %s AND s.name = ANY(%s)
GROUP BY s.name
ORDER BY last_ts DESC NULLS LAST
LIMIT 8
""",
            (user_id, TECH_SKILLS),
        ).fetchall()
        for r in rows2:
            parts.append(f"{r['skill_name']} (custom task)")
    if not parts:
        return "No recent technical tasks recorded - balance across all four skills."
    return "; ".join(parts)


def _truncate(s: str, n: int = 14000) -> str:
    s = (s or "").strip()
    if len(s) <= n:
        return s
    return s[:n] + "\n\n[truncated]"


def _cv_summary_from_lists(
    strengths: list[str], weaknesses: list[str], improvements: list[str], user_goal: str
) -> str:
    goal_label = user_goal if user_goal and user_goal != "Unknown" else "your career goal"
    summary_lines: list[str] = [
        f"Resume feedback for **{goal_label}**",
        "",
        "**Strengths**",
    ]
    summary_lines.extend(
        [f"• {x}" for x in strengths[:8]]
        if strengths
        else ["• Add clearer project and skills sections to highlight strengths."]
    )
    summary_lines.extend(["", "**Growth areas**"])
    summary_lines.extend(
        [f"• {x}" for x in weaknesses[:8]]
        if weaknesses
        else ["• Consider adding measurable outcomes to your experience bullets."]
    )
    if improvements:
        summary_lines.extend(["", "**Suggested improvements**"])
        summary_lines.extend([f"• {x}" for x in improvements[:6]])
    return "\n".join(summary_lines)


def _fallback_cv_analysis(cv_text: str, user_goal: str, file_name: str) -> dict[str, Any]:
    """Deterministic fallback when the model cannot return parseable JSON."""
    lower = (cv_text or "").lower()
    strengths: list[str] = []
    weaknesses: list[str] = []
    improvements: list[str] = []

    if any(w in lower for w in ("project", "intern", "experience", "developed", "built")):
        strengths.append("Your resume mentions hands-on projects or experience - keep highlighting outcomes.")
    if any(w in lower for w in ("python", "java", "javascript", "react", "sql", "git")):
        strengths.append("Technical skills are listed, which helps recruiters scan for role fit quickly.")
    if any(w in lower for w in ("university", "bachelor", "degree", "education")):
        strengths.append("Education credentials are present and easy to locate.")

    if "github" not in lower and "gitlab" not in lower:
        weaknesses.append("Add a GitHub or portfolio link so reviewers can verify project work.")
    if lower.count("%") < 1 and "increased" not in lower and "reduced" not in lower:
        weaknesses.append("Use measurable results (percentages, time saved, users served) in bullet points.")
    if len(cv_text) < 400:
        weaknesses.append("The extracted text is very short - ensure the PDF is text-based, not a scanned image.")

    improvements.append("Tailor the top third of your resume to match your target role keywords.")
    improvements.append("Use action verbs and one clear result per bullet (STAR-style where possible).")
    if user_goal and user_goal != "Unknown":
        improvements.append(f"Emphasize skills and projects most relevant to **{user_goal}**.")

    if not strengths:
        strengths.append(
            "Thank you for uploading your resume - we saved it so you can refine and re-analyse after edits."
        )

    chat_summary = _cv_summary_from_lists(strengths, weaknesses, improvements, user_goal)
    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvements": improvements,
        "chat_summary": chat_summary,
        "_fallback": True,
    }


async def _request_cv_analysis_json(cv_text: str, user_goal: str) -> dict:
    system = """You are a CV/resume analysis assistant for university students targeting tech careers.

RULES:
- Output ONLY one JSON object. No markdown, no prose before or after.
- Each array value must be a plain string (one short sentence).
- Provide 3–5 items per array when the CV has enough content."""

    user = f"""CAREER_GOAL: {user_goal}

CV_TEXT:
{cv_text}

Return JSON exactly in this shape:
{{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."]
}}"""

    raw = await structured_completion(system, user, json_format=True)
    try:
        return extract_cv_analysis_object(raw)
    except ValueError:
        repair = await structured_completion(
            system,
            user
            + '\n\nYour last reply was invalid. Reply with ONLY JSON: {"strengths":["..."],"weaknesses":["..."],"improvements":["..."]}',
            json_format=True,
        )
        return extract_cv_analysis_object(repair)


async def run_cv_analyze(email: str, cv_text: str, file_name: str) -> dict[str, Any]:
    row = fetch_user_learning_row(email)
    cv_text = _truncate(cv_text, 9000)
    user_goal = row["goal_name"]

    try:
        data = await _request_cv_analysis_json(cv_text, user_goal)
    except Exception:
        try:
            short = _truncate(cv_text, 4500)
            data = await _request_cv_analysis_json(short, user_goal)
        except Exception:
            uid = int(row["user_id"])
            fb = _fallback_cv_analysis(cv_text, user_goal, file_name)
            with get_conn() as conn:
                conn.execute(
                    """INSERT INTO user_cv_analysis (user_id, file_name, uploaded_at, strengths, weaknesses, improvements)
                       VALUES (%s, %s, NOW(), %s::jsonb, %s::jsonb, %s::jsonb)
                       ON CONFLICT (user_id) DO UPDATE SET
                         file_name = EXCLUDED.file_name,
                         uploaded_at = NOW(),
                         strengths = EXCLUDED.strengths,
                         weaknesses = EXCLUDED.weaknesses,
                         improvements = EXCLUDED.improvements
                    """,
                    (
                        uid,
                        file_name[:500],
                        Json(fb["strengths"]),
                        Json(fb["weaknesses"]),
                        Json(fb["improvements"]),
                    ),
                )
            return {k: v for k, v in fb.items() if k != "_fallback"}

    strengths = as_str_list(data.get("strengths"))
    weaknesses = as_str_list(data.get("weaknesses"))
    improvements = as_str_list(data.get("improvements"))

    if not strengths and not weaknesses and not improvements:
        fb = _fallback_cv_analysis(cv_text, user_goal, file_name)
        strengths = fb["strengths"]
        weaknesses = fb["weaknesses"]
        improvements = fb["improvements"]

    uid = int(row["user_id"])
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO user_cv_analysis (user_id, file_name, uploaded_at, strengths, weaknesses, improvements)
               VALUES (%s, %s, NOW(), %s::jsonb, %s::jsonb, %s::jsonb)
               ON CONFLICT (user_id) DO UPDATE SET
                 file_name = EXCLUDED.file_name,
                 uploaded_at = NOW(),
                 strengths = EXCLUDED.strengths,
                 weaknesses = EXCLUDED.weaknesses,
                 improvements = EXCLUDED.improvements
            """,
            (
                uid,
                file_name[:500],
                Json(strengths),
                Json(weaknesses),
                Json(improvements),
            ),
        )

    chat_summary = _cv_summary_from_lists(strengths, weaknesses, improvements, user_goal)

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvements": improvements,
        "chat_summary": chat_summary,
    }


async def interview_next_question(email: str, question_number: int) -> dict[str, Any]:
    row = fetch_user_learning_row(email)
    skill_level = (
        f"technical={row['technical_skill_level']}, soft={row['soft_skill_level']}"
    )

    system = """You are a behavioral interview coach.

RULES:
- One question only.
- Output ONLY JSON (no markdown).
- The candidate answers in plain chat: aim for reply length that fits in roughly 3–10 short sentences total (about one tight paragraph).
- Avoid multi-part questions, numbered sub-questions, or anything that implies a long essay, whiteboard exercise, live coding demo, role-play with multiple rounds, or “list 10 items” drills."""

    user = f"""INPUTS:
USER_GOAL: {row['goal_name']}
SKILL_LEVEL: {skill_level}

TASK:
Generate ONE interview question using real workplace scenarios.
It must ask for ONE simple STAR-style behavioral story they can explain in simple sentences.

OUTPUT FORMAT:
{{
  "type": "question",
  "question_number": {question_number},
  "question": ""
}}"""

    try:
        raw = await structured_completion(system, user)
        try:
            data = extract_json_object(raw)
        except Exception:
            raw2 = await structured_completion(
                system,
                user
                + "\n\nYour last reply was not valid JSON. Output ONLY one JSON object with "
                "type, question_number, question (string).",
            )
            data = extract_json_object(raw2)
        qtext = clean_coach_question_text(str(data.get("question") or ""))
        if not qtext:
            raise ValueError("empty question")
        return {
            "type": data.get("type", "question"),
            "question_number": int(data.get("question_number") or question_number),
            "question": qtext,
        }
    except Exception as e:
        fb = BEHAVIORAL_QUESTION_FALLBACKS[
            max(0, question_number - 1) % len(BEHAVIORAL_QUESTION_FALLBACKS)
        ]
        return {
            "type": "question",
            "question_number": question_number,
            "question": fb,
        }


async def interview_evaluate(
    email: str, question_number: int, question: str, user_answer: str
) -> dict[str, Any]:
    uid = int(fetch_user_learning_row(email)["user_id"])
    ethics = check_answer_ethics(user_answer)
    if not ethics.ethical:
        with get_conn() as conn:
            upsert_user_skill_score(conn, uid, INTERVIEW_SKILL, 1)
        return {
            "question_number": question_number,
            "score": 1,
            "feedback": ethics.message,
            "ethical_flag": True,
        }

    if is_dont_know_answer(user_answer):
        feedback = await _coach_dont_know_interview(question)
        with get_conn() as conn:
            upsert_user_skill_score(conn, uid, INTERVIEW_SKILL, 1)
        return {
            "question_number": question_number,
            "score": 1,
            "feedback": feedback,
            "dont_know": True,
        }

    system = """You are a behavioral interview evaluator.

RULES:
- Output ONLY JSON (no markdown).
- Assign only one score (1, 2, or 3).
- The user attempted a real answer."""
    system += _EVAL_FEEDBACK_RULES

    user = f"""INPUTS:
USER_ANSWER: {user_answer}
QUESTION: {question}

SCORING RUBRIC (STAR METHOD):

Score 1 (Low):
Incorrect, off-topic, or almost no usable content (not an honest "I don't know").

Score 2 (Moderate):
Partial STAR structure with some concrete details; room to improve clarity or impact.

Score 3 (Industry Ready):
Full STAR structure with clear situation, task, action, result and strong impact.

OUTPUT FORMAT:
{{
  "question_number": {question_number},
  "score": 2,
  "feedback": ""
}}"""

    try:
        raw = await structured_completion(system, user)
        try:
            data = extract_json_object(raw)
        except Exception:
            raw2 = await structured_completion(
                system,
                user
                + "\n\nReturn ONLY valid JSON with question_number, score (1-3), feedback (string).",
            )
            data = extract_json_object(raw2)
        score = int(data.get("score") or 2)
        score = max(1, min(3, score))
        feedback = clean_coach_display_text(str(data.get("feedback") or ""))
    except Exception:
        score = 2
        feedback = (
            "We could not auto-score this response. Keep using STAR: situation, task, "
            "action, and a clear result with impact."
        )

    with get_conn() as conn:
        upsert_user_skill_score(conn, uid, INTERVIEW_SKILL, score)

    return {"question_number": question_number, "score": score, "feedback": feedback}


async def evaluate_professional_communication_session(
    user_goal: str, session_history: str
) -> dict[str, Any]:
    system = """You are a Professional Communication Evaluator.

You evaluate a full chat session based on a predefined skill matrix.

SKILL MATRIX (Professional Communication):

Level 1 (Low):
- Unclear or poorly structured communication
- Informal tone
- Grammar or clarity issues
- Difficult to understand intent
- Weak or missing 7Cs

Level 2 (Moderate):
- Understandable communication
- Partially structured
- Minor clarity or tone issues
- Some 7Cs applied but inconsistent

Level 3 (Industry Ready):
- Clear, concise, well-structured communication
- Professional tone
- Direct and complete responses
- Strong and consistent 7Cs application:
  Clear, Concise, Complete, Correct, Considerate, Concrete, Courteous

RULES:
- Output ONLY JSON
- Score must be ONLY: 1 | 2 | 3
- Do NOT use any other values
- Base evaluation ONLY on the given matrix"""

    user = f"""INPUTS:
USER_GOAL: {user_goal}
SESSION_HISTORY:
{session_history[:28000]}

OUTPUT FORMAT:
{{
  "session_id": 1,
  "score": 2,
  "feedback": ""
}}"""

    raw = await structured_completion(system, user)
    try:
        data = extract_json_object(raw)
    except Exception:
        raw2 = await structured_completion(
            system,
            user
            + "\n\nReturn ONLY one JSON object with session_id (number), score (1-3), feedback (string).",
        )
        data = extract_json_object(raw2)
    score = int(data.get("score") or 2)
    score = max(1, min(3, score))
    feedback = clean_coach_display_text(
        str(data.get("feedback") or data.get("Feedback") or "")
    )
    if not feedback:
        feedback = "Review your messages for clarity, tone, and the 7Cs (clear through courteous)."
    return {"score": score, "feedback": feedback}


def persist_professional_communication_score(email: str, score: int) -> None:
    uid = int(fetch_user_learning_row(email)["user_id"])
    with get_conn() as conn:
        upsert_user_skill_score(conn, uid, PROFESSIONAL_COMMUNICATION_SKILL, score)


async def reflection_next_question(email: str, question_number: int) -> dict[str, Any]:
    row = fetch_user_learning_row(email)
    skill_level = (
        f"technical={row['technical_skill_level']}, soft={row['soft_skill_level']}"
    )

    system = """You are a Reflection and Self Assessment coach.

RULES:
- One task only
- Output ONLY JSON (no markdown)"""

    user = f"""INPUTS:
USER_GOAL: {row['goal_name']}
SKILL_LEVEL: {skill_level}

TASK:
Generate ONE reflection question to improve self-assessment skills.

OUTPUT FORMAT:
{{
  "type": "question",
  "question_number": {question_number},
  "question": ""
}}"""

    try:
        raw = await structured_completion(system, user)
        try:
            data = extract_json_object(raw)
        except Exception:
            raw2 = await structured_completion(
                system,
                user
                + "\n\nReturn ONLY JSON with type, question_number, question (string).",
            )
            data = extract_json_object(raw2)
        qtext = clean_coach_question_text(str(data.get("question") or ""))
        if not qtext:
            raise ValueError("empty reflection question")
        return {
            "type": data.get("type", "question"),
            "question_number": int(data.get("question_number") or question_number),
            "question": qtext,
        }
    except Exception:
        fb = REFLECTION_QUESTION_FALLBACKS[
            max(0, question_number - 1) % len(REFLECTION_QUESTION_FALLBACKS)
        ]
        return {"type": "question", "question_number": question_number, "question": fb}


async def reflection_evaluate(
    email: str, question_number: int, question: str, user_answer: str
) -> dict[str, Any]:
    uid = int(fetch_user_learning_row(email)["user_id"])
    ethics = check_answer_ethics(user_answer)
    if not ethics.ethical:
        with get_conn() as conn:
            upsert_user_skill_score(conn, uid, REFLECTION_SKILL, 1)
        return {
            "question_number": question_number,
            "score": 1,
            "feedback": ethics.message,
            "ethical_flag": True,
        }

    system = """You are a reflection evaluator.

RULES:
- Output ONLY JSON (no markdown).
- Assign only one score (1, 2, or 3)."""

    user = f"""INPUTS:
USER_ANSWER: {user_answer}
QUESTION: {question}

SCORING RUBRIC (KOLB'S LEARNING CYCLE):
Score 1 (Low):
Very short or generic reflection. No learning points.

Score 2 (Moderate):
Mentions learning but weak explanation of challenges or improvements.

Score 3 (Industry Ready):
Clear learning, challenges, and specific improvements. Shows growth mindset.

OUTPUT FORMAT:
{{
  "question_number": {question_number},
  "score": 2,
  "feedback": ""
}}"""

    try:
        raw = await structured_completion(system, user)
        try:
            data = extract_json_object(raw)
        except Exception:
            raw2 = await structured_completion(
                system,
                user
                + "\n\nReturn ONLY JSON with question_number, score (1-3), feedback (string).",
            )
            data = extract_json_object(raw2)
        score = int(data.get("score") or 2)
        score = max(1, min(3, score))
        feedback = clean_coach_display_text(str(data.get("feedback") or ""))
    except Exception:
        score = 2
        feedback = (
            "Could not score automatically. Mention what you learned, what was challenging, "
            "and one specific improvement you'll try next time."
        )

    with get_conn() as conn:
        upsert_user_skill_score(conn, uid, REFLECTION_SKILL, score)

    return {"question_number": question_number, "score": score, "feedback": feedback}


def _parse_task_times(
    availability_type: str, availability_hours_str: str, start_s: Any, end_s: Any
) -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    try:
        hours = max(1, min(80, int(float(str(availability_hours_str or "5")))))
    except (TypeError, ValueError):
        hours = 5

    if isinstance(start_s, str) and start_s.strip():
        try:
            start = datetime.fromisoformat(start_s.replace("Z", "+00:00"))
        except ValueError:
            start = now
    else:
        start = now

    if isinstance(end_s, str) and end_s.strip():
        try:
            end = datetime.fromisoformat(end_s.replace("Z", "+00:00"))
        except ValueError:
            end = start + timedelta(days=2)
    else:
        span = 2 if (availability_type or "").lower() == "weekly" else 1
        end = start + timedelta(days=span, hours=min(hours, 12))

    if end <= start:
        end = start + timedelta(hours=24)
    # Ensure at least one full calendar day between start and due when same-day parsed
    if end.date() <= start.date():
        end = start + timedelta(days=1, hours=min(hours, 8))
    return start, end


def pick_next_technical_skill(user_id: int) -> str:
    """Pick the technical skill used least often in agent-assigned tasks (fair rotation)."""
    counts = {name: 0 for name in TECH_SKILLS}
    with get_conn() as conn:
        rows = conn.execute(
            """
SELECT s.name, COUNT(*)::int AS cnt
FROM user_common_tasks ucm
JOIN common_tasks ct ON ct.id = ucm.common_task_id
JOIN skills s ON s.id = ct.skill_id
WHERE ucm.user_id = %s AND s.name = ANY(%s)
GROUP BY s.name
""",
            (user_id, TECH_SKILLS),
        ).fetchall()
        for r in rows:
            n = r["name"]
            if n in counts:
                counts[n] = int(r["cnt"] or 0)
    min_count = min(counts.values())
    for name in TECH_SKILLS:
        if counts[name] == min_count:
            return name
    return TECH_SKILLS[0]


async def generate_agent_task(email: str) -> dict[str, Any]:
    row = fetch_user_learning_row(email)
    uid = int(row["user_id"])
    recent = recent_skills_summary(uid)
    required_skill = pick_next_technical_skill(uid)
    now_iso = datetime.now(timezone.utc).isoformat()

    skill_levels = (
        f"technical={row['technical_skill_level']}, soft={row['soft_skill_level']}"
    )

    system = """You are a technical task generator for skill-based learning.

ABSOLUTE OUTPUT RULE:
- Respond with ONLY one JSON object. No markdown, no code fences, no commentary."""

    user = f"""INPUTS from DB about this learner:

USER_GOAL: {row['goal_name']}
REQUIRED_SKILL (you MUST use this skill): {required_skill}
SKILL_LEVELS: {skill_levels}
RECENT_SKILLS_USED: {recent}
CURRENT_TIME: {now_iso}
AVAILABILITY_TYPE: {row['availability_type']}
AVAILABILITY_HOURS: {row['availability_hours']}

AVAILABLE SKILLS:
- Code Understanding
- Debugging Reasoning
- Algorithmic Thinking
- Git Concept Knowledge

TASK:
Generate ONE task using ONLY REQUIRED_SKILL above, tailored to USER_GOAL career track.

The stored "task" string must describe ONE assignment that the user answers only by typing plain text in the chat
(2–8 sentences). No UI design, no building apps, no deployment, no file uploads, no live coding.

Write descriptive, CLEAR instructions:
- Brief workplace scenario aligned with USER_GOAL.
- Exactly what they must produce in writing (explain, trace, compare, justify, list steps).
- Explicit success criteria so answers are easy to grade from text alone.

--------------------------------------------------------------
FAIRNESS RULE (IMPORTANT)
--------------------------------------------------------------
You MUST distribute tasks fairly across all 4 skills over time.

Rules:
- Avoid repeating the most recent skill used when reasonably avoidable.
- Prefer skills that were used less frequently in RECENT_SKILLS_USED.
- Ensure balanced rotation across all 4 skills.
- Do NOT always select the same skill repeatedly.
- If unsure, choose a different skill from the one that appears most often in RECENT_SKILLS_USED.

--------------------------------------------------------------
SKILL SELECTION RULE
--------------------------------------------------------------
Select ONLY ONE skill per task:
- Code Understanding
- Debugging Reasoning
- Algorithmic Thinking
- Git Concept Knowledge

--------------------------------------------------------------
TASK RULES
--------------------------------------------------------------
- One task only.
- Must be text-answer based (user writes the full answer).
- Must be evaluatable from that text alone.
- Do not mix skills.

--------------------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
--------------------------------------------------------------
{{
  "task": "",
  "skill": "Code Understanding | Debugging Reasoning | Algorithmic Thinking | Git Concept Knowledge",
  "status": "CREATED",
  "start_time": "",
  "end_time": ""
}}

Field requirements:
- "task": multi-sentence, specific, unambiguous (aim roughly 120–350 words). No placeholders like "write about X" without defining X.
- "skill": EXACT string equal to one of the four allowed names.
- "start_time" / "end_time": ISO-8601 datetimes aligned with CURRENT_TIME, AVAILABILITY_TYPE, and AVAILABILITY_HOURS (sensible window to complete)."""

    raw = await structured_completion(system, user)
    data = extract_json_object(raw)
    task_txt = str(data.get("task") or "").strip()
    skill_name = str(data.get("skill") or "").strip()
    if skill_name not in TECH_SKILLS:
        skill_name = required_skill
    # Enforce fair rotation when model ignores REQUIRED_SKILL
    if skill_name != required_skill:
        skill_name = required_skill

    start, end = _parse_task_times(
        row["availability_type"],
        row["availability_hours"],
        data.get("start_time"),
        data.get("end_time"),
    )

    with get_conn() as conn:
        sid = skill_id(conn, skill_name)
        pending_id = status_id_by_name(conn, "pending")

        prow = conn.execute(
            """INSERT INTO common_tasks (skill_id, task)
               VALUES (%s, %s) RETURNING id""",
            (sid, task_txt[:8000]),
        ).fetchone()
        ct_id = int(prow["id"])
        ur = conn.execute(
            """INSERT INTO user_common_tasks
               (user_id, common_task_id, start_date_time, end_date_time, status_id)
               VALUES (%s, %s, %s, %s, %s) RETURNING id""",
            (uid, ct_id, start, end, pending_id),
        ).fetchone()
        user_common_id = int(ur["id"])

    chat_message = (
        "Your new task has been generated.\n\n"
        f"**Skill:** {skill_name}\n\n"
        f"{task_txt}\n\n"
        f"**Start:** {start.isoformat()}\n"
        f"**Due:** {end.isoformat()}\n\n"
        "Open **Tasks** and tap **Answer in AI Coach** to type your text response when you are ready."
    )

    return {
        "user_common_task_id": user_common_id,
        "common_task_id": ct_id,
        "task": task_txt,
        "skill": skill_name,
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "chat_message": chat_message,
    }


async def evaluate_task_answer(
    email: str,
    user_common_task_id: int,
    task_description: str,
    skill_name: str,
    user_answer: str,
) -> dict[str, Any]:
    row = fetch_user_learning_row(email)
    uid = int(row["user_id"])
    if skill_name not in TECH_SKILLS:
        raise ValueError("invalid skill for task evaluation")

    with get_conn() as conn:
        chk = conn.execute(
            """SELECT 1 FROM user_common_tasks ucm
               JOIN user_student u ON u.id = ucm.user_id
               WHERE ucm.id = %s AND u.id = %s""",
            (user_common_task_id, uid),
        ).fetchone()
    if not chk:
        raise ValueError("task not found for user")

    ethics = check_answer_ethics(user_answer)
    if not ethics.ethical:
        with get_conn() as conn:
            upsert_user_skill_score(conn, uid, skill_name, 1)
        return {
            "skill": skill_name,
            "score": 1,
            "feedback_message": ethics.message,
            "ethical_flag": True,
        }

    if is_dont_know_answer(user_answer):
        feedback = await _coach_dont_know_task(task_description, skill_name)
        with get_conn() as conn:
            upsert_user_skill_score(conn, uid, skill_name, 1)
        return {
            "skill": skill_name,
            "score": 1,
            "feedback_message": feedback,
            "dont_know": True,
        }

    system = """You are a technical skill evaluator for a learning system.

You evaluate the user's answer to a given task based ONLY on the specified skill.

--------------------------------------------------------------
RULES
--------------------------------------------------------------
- Evaluate ONLY the given skill.
- Do NOT generate new tasks.
- Do NOT ask questions.
- Output ONLY valid JSON (no markdown fences).
- Assign ONLY one score (1, 2, or 3).
- The user attempted a real answer (not an honest "I don't know")."""
    system += _EVAL_FEEDBACK_RULES

    system += """

--------------------------------------------------------------
SCORING RUBRIC (ALL SKILLS)
--------------------------------------------------------------
Score 1 (Low):
Incorrect or fundamentally misunderstands the concept. Only use when they tried but were wrong.

Score 2 (Moderate):
Partially correct with useful parts; explain gaps without calling detailed work "vague."

Score 3 (Industry Ready):
Fully correct, clear reasoning, structured explanation - tell them the answer is good/strong.

--------------------------------------------------------------
SKILL FOCUS (use only the line that matches SKILL)
--------------------------------------------------------------
Code Understanding:
Correct explanation of code logic and behavior.

Debugging Reasoning:
Correct identification of bug and explanation of fix.

Algorithmic Thinking:
Logical correctness and step-by-step reasoning.

Git Concept Knowledge:
Correct explanation of Git concept with practical understanding."""

    user = f"""INPUTS:

TASK_DESCRIPTION:
{task_description}

SKILL: {skill_name}

USER_ANSWER:
{user_answer[:12000]}

USER_GOAL: {row['goal_name']}

--------------------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
--------------------------------------------------------------
{{
  "skill": "{skill_name}",
  "score": 2,
  "feedback": "",
  "improvement_tip": ""
}}

"feedback" must address only this skill. "improvement_tip" must be one actionable sentence or empty."""

    try:
        raw = await structured_completion(system, user)
        data = extract_json_object(raw)
    except Exception:
        try:
            raw2 = await structured_completion(
                system,
                user
                + "\n\nYour last reply was not valid JSON. Output ONLY one JSON object with keys "
                "skill, score (1-3), feedback (string), improvement_tip (string). No markdown.",
            )
            data = extract_json_object(raw2)
        except Exception:
            data = {
                "score": 2,
                "feedback": (
                    "Your answer shows effort. For algorithmic tasks, break the solution into clear steps: "
                    "problem understanding, approach, and expected outcome."
                ),
                "improvement_tip": "Use numbered steps and name data structures or algorithms explicitly.",
            }

    score = max(1, min(3, int(data.get("score") or 2)))
    feedback = clean_coach_display_text(str(data.get("feedback") or ""))
    if not feedback:
        feedback = (
            "Thanks for submitting your answer. Review the task criteria and try to be more "
            "specific with examples and reasoning next time."
        )
    tip = str(data.get("improvement_tip") or "").strip()

    with get_conn() as conn:
        upsert_user_skill_score(conn, uid, skill_name, score)
        if score >= 2:
            try:
                done_id = status_id_by_name(conn, "completed")
                conn.execute(
                    """UPDATE user_common_tasks SET status_id = %s, end_date_time = COALESCE(end_date_time, NOW())
                       WHERE id = %s AND user_id = %s""",
                    (done_id, user_common_task_id, uid),
                )
            except Exception:
                pass

    # Chat/UI shows feedback only per product spec; score is persisted via user_skills.
    _ = tip  # still produced by model for potential future use / logging
    return {
        "skill": skill_name,
        "score": score,
        "feedback_message": feedback,
    }
