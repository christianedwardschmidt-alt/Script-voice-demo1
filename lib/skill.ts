export function formatNtrp(level: number): string {
  return `${level.toFixed(1)} NTRP`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic pseudo-distance (mi) derived from a profile id, so a given
 * player shows a stable "distance" without needing real device geolocation. */
export function pseudoDistance(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return Math.round(((hash % 940) / 100 + 0.2) * 10) / 10;
}

export function contextLine(p: { note: string; home_court: string }): string {
  if (p.note.trim()) return p.note.trim();
  if (p.home_court.trim()) return `Plays at ${p.home_court.trim()}`;
  return 'New to the app — say hi!';
}

export function shortContext(p: { note: string; skill_level: number }): string {
  if (p.note.trim()) return p.note.trim();
  return p.skill_level <= 3.0 ? 'Beginner friendly' : 'Ready to play';
}

export const SKILL_RANGES = [
  { id: 'all', label: 'All levels', min: 0, max: 10 },
  { id: 'beginner', label: '2.5–3.0 NTRP', min: 2.5, max: 3.0 },
  { id: 'intermediate', label: '3.0–4.0 NTRP', min: 3.0, max: 4.0 },
  { id: 'advanced', label: '4.0+ NTRP', min: 4.0, max: 10 },
] as const;

export function suggestedRangeFor(skillLevel: number) {
  return (
    SKILL_RANGES.find((r) => r.id !== 'all' && skillLevel >= r.min && skillLevel < r.max) ??
    SKILL_RANGES[2]
  );
}
