import { Avatar } from '../ui/Avatar';
import { StatCard } from '../ui/StatCard';
import { clientById, formatMinutes, getTodayIndex, relativeLabel } from '@/lib/mockData';
import type { Client, SessionItem, Trainer } from '@/lib/types';

interface HomeScreenProps {
  trainer: Trainer;
  clients: Client[];
  schedule: SessionItem[];
  onOpenSession: (session: SessionItem) => void;
  onViewFullWeek: () => void;
  onOpenProfile: () => void;
}

export function HomeScreen({ trainer, clients, schedule, onOpenSession, onViewFullWeek, onOpenProfile }: HomeScreenProps) {
  const todayIndex = getTodayIndex();
  const today = schedule
    .filter((s) => s.dayIndex === todayIndex)
    .slice()
    .sort((a, b) => a.timeMinutes - b.timeMinutes);
  const next = today.find((s) => s.status !== 'completed');

  return (
    <>
      <div className="hd">
        <div>
          <p className="hd-title">Good morning, {trainer.name}</p>
          <p className="hd-sub">{today.length} session{today.length === 1 ? '' : 's'} today</p>
        </div>
        <button onClick={onOpenProfile} aria-label="Open profile" style={{ border: 'none', background: 'none', padding: 0 }}>
          <Avatar initials={trainer.initials} size={38} />
        </button>
      </div>

      {next ? (
        <button className="hero-card" onClick={() => onOpenSession(next)}>
          <div className="hero-top">
            <span className="hero-label">Next session</span>
            <span className="pill">{relativeLabel(next.timeMinutes)}</span>
          </div>
          <div className="hero-row">
            <Avatar
              initials={clientById(next.clientId)?.initials ?? '--'}
              accent={clientById(next.clientId)?.accent}
              size={52}
              fontSize={16}
            />
            <div style={{ flex: 1 }}>
              <div className="hero-name">{clientById(next.clientId)?.name}</div>
              <div className="hero-sub">
                {next.type === 'video' ? 'Video session' : 'In-person'} · {next.label}
              </div>
            </div>
            <span className="icon-btn" aria-hidden>
              →
            </span>
          </div>
        </button>
      ) : (
        <div className="hero-card" style={{ opacity: 0.8 }}>
          <div className="hero-label">Today</div>
          <div className="hero-sub" style={{ marginTop: 6, color: 'rgba(255,255,255,.85)' }}>
            No sessions scheduled — enjoy the break.
          </div>
        </div>
      )}

      <div className="stat-row">
        <StatCard value={String(trainer.activeClients)} label="Active clients" />
        <StatCard value={String(trainer.newMatches)} label="New matches" />
        <StatCard value={`${trainer.retention}%`} label="Retention" />
      </div>

      <div className="section-hd">
        <span className="section-title">Today&apos;s schedule</span>
        <button className="section-link" onClick={onViewFullWeek}>
          Full week
        </button>
      </div>
      <div className="list">
        {today.length === 0 && <div className="empty-note">Nothing on the books today.</div>}
        {today.map((session) => {
          const client = clientById(session.clientId);
          return (
            <button key={session.id} className="row-card" onClick={() => onOpenSession(session)}>
              <span className="row-time">{formatMinutes(session.timeMinutes)}</span>
              <span style={{ flex: 1 }}>
                <span className="row-title" style={{ display: 'block' }}>
                  {client?.name}
                </span>
                <span className="row-sub" style={{ display: 'block' }}>
                  {session.type === 'video' ? 'Video' : 'In-person'} · {session.label}
                </span>
              </span>
              {session.status === 'completed' && <span className="status-pill completed">Done</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}
