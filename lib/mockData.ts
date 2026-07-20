import type { Client, ChatMessage, Conversation, SessionItem, Trainer } from './types';

export const TRAINER: Trainer = {
  name: 'Ray',
  fullName: 'Ray Holloway',
  initials: 'RH',
  email: 'ray.holloway@trainer.app',
  activeClients: 12,
  newMatches: 3,
  retention: 96,
};

export const CLIENTS: Client[] = [
  {
    id: 'priya',
    name: 'Priya Nair',
    initials: 'PN',
    accent: '#3a7dff',
    weeksInProgram: 12,
    weightChangeLb: -8.2,
    sessionsCompleted: 34,
    weekStreak: 6,
    weightLog: [171, 169.5, 168, 167, 165, 164, 163.2, 162.8],
    goals: [
      { id: 'g1', text: 'Bodyweight squat x15', met: true },
      { id: 'g2', text: '5k run under 30 min', met: false },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Diaz',
    initials: 'MD',
    accent: '#7ab0ff',
    weeksInProgram: 7,
    weightChangeLb: -3.4,
    sessionsCompleted: 19,
    weekStreak: 3,
    weightLog: [201, 200, 198.5, 198, 197, 196, 195, 194.6],
    goals: [
      { id: 'g1', text: 'Full mobility in hips', met: false },
      { id: 'g2', text: 'Deadlift 1.5x bodyweight', met: false },
    ],
  },
  {
    id: 'elena',
    name: 'Elena Ford',
    initials: 'EF',
    accent: '#9fc0ff',
    weeksInProgram: 20,
    weightChangeLb: -14.1,
    sessionsCompleted: 52,
    weekStreak: 11,
    weightLog: [180, 177, 174, 172, 170, 168.5, 167, 165.9],
    goals: [
      { id: 'g1', text: 'Lose 15 lb', met: false },
      { id: 'g2', text: 'Hold plank 2 min', met: true },
    ],
  },
  {
    id: 'tom',
    name: 'Tom Becker',
    initials: 'TB',
    accent: '#3a7dff',
    weeksInProgram: 4,
    weightChangeLb: -1.2,
    sessionsCompleted: 8,
    weekStreak: 4,
    weightLog: [214, 213.5, 213, 212.6, 212.8, 212.1, 211.7, 212.8],
    goals: [
      { id: 'g1', text: 'Consistent 3x/week', met: true },
      { id: 'g2', text: 'Bench bodyweight', met: false },
    ],
  },
  {
    id: 'sam',
    name: 'Sam Lee',
    initials: 'SL',
    accent: '#7ab0ff',
    weeksInProgram: 15,
    weightChangeLb: -6.7,
    sessionsCompleted: 41,
    weekStreak: 8,
    weightLog: [158, 156.5, 155, 154, 153.2, 152.5, 151.9, 151.3],
    goals: [
      { id: 'g1', text: 'Run a 10k', met: true },
      { id: 'g2', text: 'Improve sleep consistency', met: false },
    ],
  },
];

export const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

let sessionSeq = 0;
function s(
  clientId: string,
  dayIndex: number,
  timeMinutes: number,
  type: 'video' | 'in-person',
  label: string,
  status: 'confirmed' | 'pending' | 'completed'
): SessionItem {
  sessionSeq += 1;
  return { id: `sess-${sessionSeq}`, clientId, dayIndex, timeMinutes, type, label, status };
}

export const INITIAL_SCHEDULE: SessionItem[] = [
  s('marcus', 0, 9 * 60, 'in-person', 'Full body', 'confirmed'),
  s('elena', 0, 14 * 60, 'in-person', 'Mobility', 'confirmed'),

  s('priya', 1, 9 * 60 + 35, 'video', 'Strength A', 'confirmed'),
  s('marcus', 1, 14 * 60, 'in-person', 'Mobility', 'confirmed'),
  s('elena', 1, 16 * 60 + 30, 'video', 'Check-in', 'pending'),
  s('tom', 1, 18 * 60, 'video', 'Strength B', 'confirmed'),

  s('sam', 2, 8 * 60, 'in-person', 'Endurance', 'confirmed'),
  s('priya', 2, 12 * 60 + 30, 'video', 'Mobility', 'pending'),

  s('tom', 3, 9 * 60, 'in-person', 'Strength A', 'confirmed'),
  s('sam', 3, 17 * 60, 'video', 'Check-in', 'confirmed'),

  s('marcus', 4, 10 * 60, 'video', 'Strength B', 'pending'),
  s('elena', 4, 15 * 60 + 30, 'in-person', 'Full body', 'confirmed'),
];

export function formatMinutes(mins: number): string {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h24 >= 12 ? 'p' : 'a';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return m === 0 ? `${h12}:00${period}` : `${h12}:${String(m).padStart(2, '0')}${period}`;
}

export const CONVERSATIONS: Conversation[] = [
  { clientId: 'priya', timeLabel: '2m', preview: 'Ready for our 4:30 session!', unread: true },
  { clientId: 'marcus', timeLabel: '1h', preview: 'Can we push to 2:30 tomorrow?', unread: false },
  { clientId: 'elena', timeLabel: '3h', preview: 'Logged my meals for the week ✓', unread: false },
  { clientId: 'tom', timeLabel: '1d', preview: "Thanks for today's session!", unread: false },
  { clientId: 'sam', timeLabel: '2d', preview: 'Sounds good, see you then', unread: false },
];

export const INITIAL_THREADS: Record<string, ChatMessage[]> = {
  priya: [
    { id: 'm1', clientId: 'priya', from: 'client', text: 'Hey Ray! Quick q — should I eat before our session today?', timeLabel: '9:02a' },
    { id: 'm2', clientId: 'priya', from: 'trainer', text: 'Light snack an hour before is perfect, nothing heavy.', timeLabel: '9:10a' },
    { id: 'm3', clientId: 'priya', from: 'client', text: 'Ready for our 4:30 session!', timeLabel: '9:12a' },
  ],
  marcus: [
    { id: 'm1', clientId: 'marcus', from: 'client', text: 'Can we push to 2:30 tomorrow?', timeLabel: '1h ago' },
  ],
  elena: [
    { id: 'm1', clientId: 'elena', from: 'client', text: 'Logged my meals for the week ✓', timeLabel: '3h ago' },
  ],
  tom: [
    { id: 'm1', clientId: 'tom', from: 'client', text: "Thanks for today's session!", timeLabel: '1d ago' },
  ],
  sam: [
    { id: 'm1', clientId: 'sam', from: 'client', text: 'Sounds good, see you then', timeLabel: '2d ago' },
  ],
};

let idCounter = 0;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function clientById(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}

export function getTodayIndex(): number {
  const day = new Date().getDay(); // 0 Sun .. 6 Sat
  if (day === 0) return 0;
  if (day === 6) return 4;
  return day - 1;
}

export function relativeLabel(targetMinutes: number): string {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = targetMinutes - nowMinutes;
  if (diff <= 0) return diff > -60 ? 'In progress' : 'Today';
  if (diff < 60) return `In ${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m === 0 ? `In ${h}h` : `In ${h}h ${m}m`;
}
