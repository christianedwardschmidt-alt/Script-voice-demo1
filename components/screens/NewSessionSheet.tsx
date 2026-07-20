import { useState } from 'react';
import { WEEKDAY_LABELS, nextId } from '@/lib/mockData';
import type { Client, SessionItem, SessionType } from '@/lib/types';

interface NewSessionSheetProps {
  clients: Client[];
  onClose: () => void;
  onCreate: (session: SessionItem) => void;
}

export function NewSessionSheet({ clients, onClose, onCreate }: NewSessionSheetProps) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<SessionType>('video');
  const [label, setLabel] = useState('');

  const canSubmit = clientId !== '' && time !== '' && label.trim() !== '';

  function submit() {
    if (!canSubmit) return;
    const [h, m] = time.split(':').map(Number);
    onCreate({
      id: nextId('sess'),
      clientId,
      dayIndex,
      timeMinutes: h * 60 + m,
      type,
      label: label.trim(),
      status: 'confirmed',
    });
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />
        <div className="sheet-title">New session</div>

        <div className="field">
          <label className="field-label" htmlFor="ns-client">
            Client
          </label>
          <select id="ns-client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ns-day">
            Day
          </label>
          <select id="ns-day" value={dayIndex} onChange={(e) => setDayIndex(Number(e.target.value))}>
            {WEEKDAY_LABELS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ns-time">
            Time
          </label>
          <input id="ns-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div className="field">
          <span className="field-label">Type</span>
          <div className="seg">
            <button className={type === 'video' ? 'active' : ''} onClick={() => setType('video')}>
              Video
            </button>
            <button className={type === 'in-person' ? 'active' : ''} onClick={() => setType('in-person')}>
              In-person
            </button>
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ns-label">
            Session type
          </label>
          <input
            id="ns-label"
            placeholder="e.g. Strength A, Mobility"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <button className="btn-primary" disabled={!canSubmit} onClick={submit}>
          Add session
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
