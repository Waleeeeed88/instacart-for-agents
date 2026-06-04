export function linesOf(text: string | null | undefined): string[] {
  return String(text ?? '')
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function nearestLine(
  lines: string[],
  index: number,
  direction: 1 | -1,
  predicate: (line: string) => boolean,
  maxSteps = 8,
): string | null {
  for (let step = 1; step <= maxSteps; step += 1) {
    const candidate = lines[index + direction * step];
    if (candidate && predicate(candidate)) return candidate;
  }
  return null;
}
