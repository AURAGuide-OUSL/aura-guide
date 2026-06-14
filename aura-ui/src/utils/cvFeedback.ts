/** normalize legacy bullets where the model stored Python-style `{ id, description }` as text. */
export function prettifyCvLine(raw: unknown): string {
  const line = typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
  if (!line) return "";

  const desc = /["']description["']\s*:\s*["']([^"']*)["']/i.exec(line);
  if (!desc?.[1]) return line.replace(/\*\*/g, "").trim();

  const txt = desc[1].replace(/\\'/g, "'");
  const idMatch = /["']id["']\s*:\s*["']([^"']*)["']/i.exec(line);
  const idRaw = idMatch?.[1]?.trim().replace(/_/g, " ") ?? "";
  if (idRaw && !txt.toLowerCase().startsWith(idRaw.toLowerCase())) {
    const label = idRaw.length ? idRaw.slice(0, 1).toUpperCase() + idRaw.slice(1) : idRaw;
    return `${label}: ${txt}`;
  }
  return txt;
}
