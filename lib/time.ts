export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function fmtClock(d: Date): string {
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? 'pm' : 'am';
  const hour12 = ((hours + 11) % 12) + 1;
  return minutes === 0 ? `${hour12}${period}` : `${hour12}:${String(minutes).padStart(2, '0')}${period}`;
}

/** "Today, 6pm" / "Tomorrow, 6pm" / "Sat, Jul 25, 6pm" — matches the date/time pill style. */
export function fmtMatchPill(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const dayDiff = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  let day: string;
  if (dayDiff === 0) day = 'Today';
  else if (dayDiff === 1) day = 'Tomorrow';
  else day = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  return `${day}, ${fmtClock(d)}`;
}

/** Full readable date + time, e.g. "Sat, Jul 25 · 6:00pm" */
export function fmtFull(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${fmtClock(d)}`;
}

/** Default value for a <input type="datetime-local">: next Saturday at 10am. */
export function defaultProposedTime(): string {
  const d = new Date();
  const daysUntilSaturday = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  d.setHours(10, 0, 0, 0);
  return toDatetimeLocal(d);
}

export function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
