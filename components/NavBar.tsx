'use client';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'progress', label: 'Progress' },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]['key'];

interface NavBarProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  focusHours: number;
}

export function NavBar({ active, onNavigate, focusHours }: NavBarProps) {
  return (
    <>
      <div className="topbar">
        <div className="topbar-brand">Fieldwork</div>
        <div className="topbar-dots">
          {NAV_ITEMS.map((item) => (
            <button key={item.key} onClick={() => onNavigate(item.key)} aria-label={item.label}>
              <div
                className="nav-dot"
                style={{ background: item.key === active ? 'var(--accent)' : 'var(--text-off)' }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar">
        <div className="sidebar-brand">Fieldwork</div>
        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item${item.key === active ? ' active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              <div
                className="nav-dot"
                style={{ background: item.key === active ? 'var(--accent)' : 'var(--text-off)' }}
              />
              {item.label}
            </button>
          ))}
        </div>
        <div className="focus-box">
          <div className="focus-box-label">Today&apos;s focus</div>
          <div className="focus-box-value">{focusHours}h logged</div>
        </div>
      </div>
    </>
  );
}
