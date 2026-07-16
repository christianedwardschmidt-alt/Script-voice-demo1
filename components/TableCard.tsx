'use client';

import { MeepleIcon } from './BrandMark';
import type { TableWithPlayers } from '@/lib/types';

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function TableCard({
  table,
  currentUserId,
  hostedCount,
  justJoined,
  onJoin,
  onLeave,
  pending,
}: {
  table: TableWithPlayers;
  currentUserId: string;
  hostedCount: number;
  justJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  pending: boolean;
}) {
  const seatsFilled = table.players.length;
  const full = seatsFilled >= table.max_players;
  const joined = table.players.some((p) => p.user_id === currentUserId);
  const expClass = table.experience === 'Beginner friendly' ? 'tag-beginner' : '';
  const hostName = table.hostProfile?.display_name || 'Unknown host';
  const hostTrust = hostedCount > 1 ? `Hosted ${hostedCount} tables here` : 'New host — first table';

  return (
    <div className="card">
      <div className="spine" />
      <div className="body">
        <div className="game">{table.game}</div>
        <div className="host">Hosted by {hostName}</div>
        <div className="host-stat">{hostTrust}</div>
        <div className="meta" style={{ marginTop: 10 }}>
          <span>{fmtDate(table.session_date)}</span>
          <span>{fmtTime(table.session_time)}</span>
          <span>{table.location}</span>
          <span className={expClass}>{table.experience}</span>
        </div>
        {table.notes && <div className="notes">{table.notes}</div>}
        <div className="seats" aria-label={`${seatsFilled} of ${table.max_players} seats filled`}>
          {Array.from({ length: table.max_players }).map((_, i) => {
            const isFilled = i < seatsFilled;
            const isJustFilled = justJoined && i === seatsFilled - 1;
            return <MeepleIcon key={i} filled={isFilled} justFilled={isJustFilled} />;
          })}
          <span className="seat-label">{seatsFilled}/{table.max_players} seated</span>
        </div>
        <div className="players">
          Players: {table.players.map((p) => p.profile?.display_name || 'Player').join(', ') || 'None yet'}
        </div>
        <div className="rowbtns">
          {joined ? (
            <button className="ghost" onClick={onLeave} disabled={pending} aria-label={`Leave ${table.game} table`}>
              {pending ? 'Please wait...' : 'Leave table'}
            </button>
          ) : (
            <button
              className="primary"
              onClick={onJoin}
              disabled={full || pending}
              aria-label={full ? `${table.game} table is full` : `Claim a seat at ${table.game}`}
            >
              {pending ? 'Please wait...' : full ? 'Table full' : 'Claim a seat'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
