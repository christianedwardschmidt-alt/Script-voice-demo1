import { Avatar } from '../ui/Avatar';
import { formatMinutes, WEEKDAY_LABELS } from '@/lib/mockData';
import type { Client, SessionItem } from '@/lib/types';

interface SessionDetailSheetProps {
  session: SessionItem;
  client: Client;
  onClose: () => void;
  onComplete: () => void;
  onMessage: () => void;
}

export function SessionDetailSheet({ session, client, onClose, onComplete, onMessage }: SessionDetailSheetProps) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <Avatar initials={client.initials} accent={client.accent} size={44} />
          <div>
            <div className="sheet-title" style={{ marginBottom: 2 }}>
              {client.name}
            </div>
            <div className="hd-sub">
              {WEEKDAY_LABELS[session.dayIndex]} · {formatMinutes(session.timeMinutes)} · {session.label}
            </div>
          </div>
        </div>
        <button className="btn-secondary" onClick={onMessage}>
          Message {client.name.split(' ')[0]}
        </button>
        <button className="btn-primary" onClick={onComplete}>
          Mark complete
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
