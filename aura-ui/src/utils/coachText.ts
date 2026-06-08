/** Strip JSON/markdown artifacts from coach question text before display. */
export function sanitizeCoachQuestion(raw: string): string {
  let t = (raw || "").trim();
  if (!t) return "";

  if (t.startsWith("{")) {
    try {
      const parsed = JSON.parse(t) as { question?: unknown };
      if (typeof parsed.question === "string" && parsed.question.trim()) {
        t = parsed.question.trim();
      }
    } catch {
      /* keep original */
    }
  }

  t = t.replace(/```[\s\S]*?```/g, "").replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/^#+\s*/gm, "");
  return t.trim();
}

export function formatCoachQuestion(label: string, number: number, question: string): string {
  const q = sanitizeCoachQuestion(question);
  return `${label} ${number}\n\n${q}`;
}
