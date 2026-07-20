export type SessionType = 'video' | 'in-person';
export type SessionStatus = 'confirmed' | 'pending' | 'completed';

export interface Goal {
  id: string;
  text: string;
  met: boolean;
}

export interface Client {
  id: string;
  name: string;
  initials: string;
  accent: string;
  weeksInProgram: number;
  weightChangeLb: number;
  sessionsCompleted: number;
  weekStreak: number;
  weightLog: number[];
  goals: Goal[];
}

export interface SessionItem {
  id: string;
  clientId: string;
  dayIndex: number; // 0=Mon .. 4=Fri
  timeMinutes: number; // minutes since midnight, for sorting/display
  type: SessionType;
  label: string;
  status: SessionStatus;
}

export interface ChatMessage {
  id: string;
  clientId: string;
  from: 'trainer' | 'client';
  text: string;
  timeLabel: string;
}

export interface Conversation {
  clientId: string;
  timeLabel: string;
  preview: string;
  unread: boolean;
}

export interface Trainer {
  name: string;
  fullName: string;
  initials: string;
  email: string;
  activeClients: number;
  newMatches: number;
  retention: number;
}

export interface CallState {
  sessionId: string;
  clientId: string;
  muted: boolean;
  cameraOn: boolean;
  elapsedSec: number;
  setLabel: string;
  exerciseLabel: string;
}
