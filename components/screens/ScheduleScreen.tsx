import { useState } from 'react';
import { WEEKDAY_LABELS, clientById, formatMinutes, getTodayIndex } from '@/lib/mockData';
import type { SessionItem } from '@/lib/types';

interface ScheduleScreenProps {
  schedule: SessionItem[];
  onOpenSession: (session: SessionItem) => void;
  onAdd: () => void;
}

function weekDates(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function ScheduleScreen({ schedule, onOpenSession, onAdd }: ScheduleScreenProps) {
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const dates = weekDates();
  const agenda = schedule
    .filter((s) => s.dayIndex === selectedDay)
    .slice()
    .sort((a, b) => a.timeMinutes - b.timeMinutes);

  return (
    <>
      <div className="hd">
        <p className="hd-title sm">Schedule</p>
        <button className="icon-btn" onClick={onAdd} aria-label="Add session">
          +
        </button>
      </div>
      <div className="week-strip">
        {WEEKDAY_LABELS.map((label, i) => (
          <button
            key={label}
            className={`day-cell${i === selectedDay ? ' active' : ''}`}
            onClick={() => setSelectedDay(i)}
          >
            <div className="day-name">{label}</div>
            <div className="day-num">{dates[i].getDate()}</div>
          </button>
        ))}
      </div>
      <div className="list">
        {agenda.length === 0 && <div className="empty-note">No sessions this day.</div>}
        {agenda.map((session) => {
          const client = clientById(session.clientId);
          return (
            <button key={session.id} className="row-card" onClick={() => onOpenSession(session)}>
              <span className="row-time wide">{formatMinutes(session.timeMinutes)}</span>
              <span style={{ flex: 1 }}>
                <span className="row-title" style={{ display: 'block' }}>
                  {client?.name}
                </span>
                <span className="row-sub" style={{ display: 'block' }}>
                  {session.type === 'video' ? 'Video' : 'In-person'} · {session.label}
                </span>
              </span>
              <span className={`status-pill ${session.status}`}>
                {session.status === 'confirmed' ? 'Confirmed' : session.status === 'pending' ? 'Pending' : 'Done'}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
