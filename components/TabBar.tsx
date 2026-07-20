'use client';

export type Tab = 'home' | 'players' | 'coaches' | 'profile';

const ICONS: Record<Tab, React.ReactNode> = {
  home: (
    <path
      d="M3.5 10.5 12 3.5l8.5 7M5.5 9.5V20a1 1 0 0 0 1 1h4v-6h3v6h4a1 1 0 0 0 1-1V9.5"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  players: (
    <>
      <circle cx="8.5" cy="8" r="2.8" fill="none" strokeWidth="1.8" />
      <circle cx="16" cy="9" r="2.2" fill="none" strokeWidth="1.8" />
      <path
        d="M3 20v-1.2C3 16 5.6 14 8.5 14s5.5 2 5.5 4.8V20M14.5 20v-.8c0-2-1.4-3.7-3.3-4.5.7-.4 1.6-.7 2.6-.7 2.5 0 4.7 1.7 4.7 4v2"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  coaches: (
    <>
      <ellipse cx="9" cy="7" rx="5" ry="6" fill="none" strokeWidth="1.8" transform="rotate(-18 9 7)" />
      <path d="M12.6 11.6 20.5 19.5" fill="none" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.7 17.7l2.3 2.3" fill="none" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.6" fill="none" strokeWidth="1.8" />
      <path d="M4.5 20c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

const LABELS: Record<Tab, string> = {
  home: 'Home',
  players: 'Matches',
  coaches: 'Coaches',
  profile: 'Profile',
};

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tab-bar">
      {(Object.keys(LABELS) as Tab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          className={`tab-item${tab === active ? ' active' : ''}`}
          onClick={() => onChange(tab)}
          aria-current={tab === active ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24">{ICONS[tab]}</svg>
          <span>{LABELS[tab]}</span>
        </button>
      ))}
    </nav>
  );
}
