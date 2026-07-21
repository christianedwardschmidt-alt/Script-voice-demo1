'use client';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarCardProps {
  viewYear: number;
  viewMonth: number;
  selectedDay: number;
  today: Date;
  eventDays: Set<number>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: number) => void;
}

export function CalendarCard({
  viewYear,
  viewMonth,
  selectedDay,
  today,
  eventDays,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}: CalendarCardProps) {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const cells: { day: number | null }[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  return (
    <div id="calendar" className="card">
      <div className="card-head">
        <div className="card-title">{MONTHS[viewMonth]} {viewYear}</div>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={onPrevMonth} aria-label="Previous month">‹</button>
          <button className="cal-nav-btn" onClick={onNextMonth} aria-label="Next month">›</button>
        </div>
      </div>
      <div className="cal-weekdays">
        {WEEKDAYS.map((d, i) => (
          <div className="cal-weekday" key={i}>{d}</div>
        ))}
      </div>
      <div className="cal-days">
        {cells.map((cell, i) => {
          if (cell.day === null) return <div key={i} className="cal-cell" />;
          const isToday = isCurrentMonth && cell.day === today.getDate();
          const isSelected = isCurrentMonth && cell.day === selectedDay;
          const hasEvent = isCurrentMonth && eventDays.has(cell.day) && !isSelected;
          return (
            <button
              key={i}
              className="cal-cell"
              onClick={() => onSelectDay(cell.day as number)}
              style={{
                background: isSelected ? 'var(--accent)' : 'transparent',
                color: isSelected ? '#181818' : isToday ? '#fafafa' : '#c4c4c4',
                border: isToday && !isSelected ? '1px solid var(--accent)' : 'none',
              }}
            >
              <div>{cell.day}</div>
              {hasEvent && <div className="cal-dot" style={{ background: 'var(--accent)' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
