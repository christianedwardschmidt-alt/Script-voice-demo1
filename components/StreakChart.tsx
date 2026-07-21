const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakChart({ activeDays }: { activeDays: number }) {
  return (
    <div className="card streak-card">
      <div className="streak-title">This week&apos;s streak</div>
      <div className="streak-row">
        {DAY_LABELS.map((label, i) => (
          <div className="streak-day" key={i}>
            <div
              className="streak-bar"
              style={{ background: i < activeDays ? 'var(--accent)' : 'var(--border)' }}
            />
            <div className="streak-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
