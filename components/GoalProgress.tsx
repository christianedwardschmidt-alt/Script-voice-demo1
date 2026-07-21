interface GoalProgressProps {
  title: string;
  pct: number;
}

export function GoalProgress({ title, pct }: GoalProgressProps) {
  return (
    <div id="progress" className="card goal-card">
      <div className="goal-head">
        <div className="goal-title">{title}</div>
        <div className="goal-pct">{pct}%</div>
      </div>
      <div className="goal-track">
        <div className="goal-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
