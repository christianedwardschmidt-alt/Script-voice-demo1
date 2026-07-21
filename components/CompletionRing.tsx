interface CompletionRingProps {
  completedCount: number;
  totalCount: number;
}

export function CompletionRing({ completedCount, totalCount }: CompletionRingProps) {
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const dasharray = `${(circumference * pct) / 100} ${circumference}`;

  return (
    <div className="card ring-card">
      <div className="ring-wrap">
        <svg width="74" height="74" viewBox="0 0 74 74" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="37" cy="37" r={radius} fill="none" stroke="#2a2a2a" strokeWidth="7" />
          <circle
            cx="37" cy="37" r={radius} fill="none"
            stroke="var(--accent)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={dasharray}
          />
        </svg>
        <div className="ring-pct">{pct}%</div>
      </div>
      <div>
        <div className="ring-title">Today&apos;s completion</div>
        <div className="ring-sub">{completedCount} of {totalCount} tasks done</div>
      </div>
    </div>
  );
}
