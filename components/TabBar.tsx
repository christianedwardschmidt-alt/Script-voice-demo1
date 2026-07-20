export type Tab = 'home' | 'clients' | 'messages' | 'schedule' | 'profile';

const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'clients', label: 'Clients' },
  { id: 'messages', label: 'Messages' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'profile', label: 'Profile' },
];

interface TabBarProps {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <button key={t.id} className="tabitem" onClick={() => onSelect(t.id)} aria-current={isActive}>
            <span className={`tabdot${isActive ? ' active' : ''}`} />
            <span className={`tablabel${isActive ? ' active' : ''}`}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
