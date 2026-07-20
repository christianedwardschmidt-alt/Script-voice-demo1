import { Avatar } from '../ui/Avatar';
import { StatCard } from '../ui/StatCard';
import type { Client } from '@/lib/types';

interface ClientDetailScreenProps {
  client: Client;
  onBack: () => void;
  onToggleGoal: (goalId: string) => void;
  onMessage: () => void;
}

function chartPoints(weightLog: number[]): string {
  if (weightLog.length === 0) return '';
  const min = Math.min(...weightLog);
  const max = Math.max(...weightLog);
  const range = max - min || 1;
  return weightLog
    .map((w, i) => {
      const x = (i / (weightLog.length - 1 || 1)) * 300;
      const y = 10 + ((w - min) / range) * 70;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function ClientDetailScreen({ client, onBack, onToggleGoal, onMessage }: ClientDetailScreenProps) {
  const points = chartPoints(client.weightLog);
  const weightLabel = `${client.weightChangeLb > 0 ? '+' : ''}${client.weightChangeLb.toFixed(1)}`;

  return (
    <>
      <div className="back-row">
        <button className="icon-btn ghost" onClick={onBack} aria-label="Back">
          ‹
        </button>
      </div>
      <div className="client-hd" style={{ paddingTop: 0 }}>
        <Avatar initials={client.initials} accent={client.accent} size={48} />
        <div>
          <p className="hd-title sm" style={{ margin: 0 }}>
            {client.name}&apos;s progress
          </p>
          <p className="hd-sub" style={{ marginTop: 2 }}>
            {client.weeksInProgram} weeks in program
          </p>
        </div>
      </div>

      <div className="stat-row">
        <StatCard value={`${weightLabel}lb`} label="Since start" />
        <StatCard value={String(client.sessionsCompleted)} label="Sessions done" />
        <StatCard value={String(client.weekStreak)} label="Week streak" />
      </div>

      <div className="section-hd" style={{ paddingBottom: 10 }}>
        <span className="section-title">Weight trend</span>
      </div>
      <div className="chart-card">
        <svg viewBox="0 0 300 90" width="100%" height="90" preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke="#3a7dff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="section-hd" style={{ paddingBottom: 10 }}>
        <span className="section-title">Goals</span>
      </div>
      <div className="list">
        {client.goals.map((goal) => (
          <button key={goal.id} className="goal-row" onClick={() => onToggleGoal(goal.id)}>
            <span className="goal-text">{goal.text}</span>
            <span className={`goal-status${goal.met ? ' met' : ''}`}>{goal.met ? '✓ Met' : 'In progress'}</span>
          </button>
        ))}
      </div>

      <div className="px" style={{ marginTop: 16, marginBottom: 6 }}>
        <button className="btn-secondary" onClick={onMessage}>
          Message {client.name.split(' ')[0]}
        </button>
      </div>
    </>
  );
}
