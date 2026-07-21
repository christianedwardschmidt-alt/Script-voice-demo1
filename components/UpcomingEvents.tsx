import type { CalendarEvent } from '@/lib/types';

const COLOR_VARS: Record<CalendarEvent['color'], string> = {
  accent: 'var(--accent)',
  secondary: 'var(--secondary)',
  tertiary: 'var(--tertiary)',
};

export function UpcomingEvents({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="card">
      <div className="card-title" style={{ marginBottom: 14 }}>Upcoming</div>
      <div className="event-list">
        {events.map((ev, i) => (
          <div className="event-row" key={i}>
            <div className="event-bar" style={{ background: COLOR_VARS[ev.color] }} />
            <div>
              <div className="event-title">{ev.title}</div>
              <div className="event-time">{ev.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
