export function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2c6 8 10 14 10 21a10 10 0 0 1-20 0c0-3 1-5.5 3-8 .5 3 2 4.5 3.5 5.5-1-3-1-7 1-10.5 1 2 2.5 3.5 4 4.5-1-4.5-2.5-8-1.5-12.5z" />
      </svg>
    </div>
  );
}

export function ReactionBadge({ emoji, count, active }: { emoji: string; count: number; active: boolean }) {
  return (
    <span className={`reaction-badge${active ? ' active' : ''}`}>
      <span aria-hidden="true">{emoji}</span>
      {count > 0 && <span className="reaction-count">{count}</span>}
    </span>
  );
}
