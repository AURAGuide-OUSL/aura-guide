import json
import re


def _strip_markdown_fences(text: str) -> str:
    s = (text or "").strip()
    if not s.startswith("```"):
        return s
    # ```json\n{...}\n```
    lines = s.split("\n")
    if not lines:
        return s
    first = lines[0].strip()
    if first.startswith("```"):
        lines = lines[1:]
    while lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines).strip()


def _brace_match_object(s: str, start: int) -> str | None:
    """Return substring from first balanced { ... } starting at start, or None."""
    if start < 0 or start >= len(s) or s[start] != "{":
        return None
    depth = 0
    in_string = False
    escape = False
    quote = ""
    for i in range(start, len(s)):
        ch = s[i]
        if escape:
            escape = False
            continue
        if in_string:
            if ch == "\\":
                escape = True
            elif ch == quote:
                in_string = False
                quote = ""
            continue
        if ch in ('"', "'"):
            in_string = True
            quote = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return s[start : i + 1]
    return None


def extract_json_object(text: str) -> dict:
    """Parse first JSON object from model output (handles ``` fences and nested braces)."""
    s = _strip_markdown_fences(text)
    # If fences left inline content, strip again
    if "```" in s:
        s = _strip_markdown_fences(s)
    if not s:
        raise ValueError("empty model response")

    # Avoid broken non-greedy regex: find { and brace-match with string awareness
    brace = s.find("{")
    if brace == -1:
        raise ValueError("no JSON object in response")
    chunk = _brace_match_object(s, brace)
    if not chunk:
        raise ValueError("unbalanced JSON braces")
    return json.loads(chunk)


def clean_coach_question_text(text: str) -> str:
    """Normalize interview/reflection question text for chat display."""
    t = _strip_markdown_fences((text or "").strip())
    if t.startswith("{"):
        try:
            data = extract_json_object(t)
            q = data.get("question")
            if q is not None:
                t = str(q).strip()
        except Exception:
            pass
    t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
    t = re.sub(r"^#+\s*", "", t, flags=re.MULTILINE)
    t = re.sub(r"^[`\"']+|[`\"']+$", "", t.strip())
    return t.strip()


def coerce_cv_feedback_line(item: object) -> str:
    """Flatten model output so CV bullets are readable (models often emit {{id, description}} objects)."""
    if item is None:
        return ""
    if isinstance(item, str):
        return item.strip()
    if isinstance(item, dict):
        desc = (
            item.get("description")
            or item.get("text")
            or item.get("detail")
            or item.get("content")
            or item.get("summary")
            or item.get("value")
        )
        label = item.get("title") or item.get("label") or item.get("name") or item.get("category") or item.get("id")
        if isinstance(desc, str) and desc.strip():
            ds = desc.strip()
            if isinstance(label, (str, int, float)) and str(label).strip():
                ls = str(label).strip().replace("_", " ")
                if ds.lower().startswith(ls.lower()):
                    return ds
                return f"{ls.title()}: {ds}"
            return ds
        nested = item.get("items") or item.get("points") or item.get("bullets")
        if isinstance(nested, list):
            parts = [coerce_cv_feedback_line(x) for x in nested]
            return "; ".join(p for p in parts if p)
        str_vals = [str(v).strip() for v in item.values() if isinstance(v, str) and str(v).strip()]
        if str_vals:
            return " — ".join(str_vals)
        return ""
    if isinstance(item, (int, float, bool)):
        return str(item).strip()
    return str(item).strip()


def as_str_list(val) -> list[str]:
    if val is None:
        return []
    if isinstance(val, str):
        return [val.strip()] if val.strip() else []
    if isinstance(val, list):
        out: list[str] = []
        for x in val:
            line = coerce_cv_feedback_line(x)
            if line:
                out.append(line)
        return out
    single = coerce_cv_feedback_line(val)
    return [single] if single else []
