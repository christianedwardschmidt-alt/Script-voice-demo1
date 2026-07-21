import type { Task, TaskTag } from '@/lib/types';

const TAG_COLORS: Record<TaskTag, string> = {
  Work: 'var(--accent)',
  Health: 'var(--secondary)',
  Meetings: 'var(--tertiary)',
  Personal: 'var(--text-muted)',
};

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div id="tasks" className="card">
      <div className="card-head">
        <div className="card-title">Tasks</div>
        <div className="task-count">{completedCount} / {tasks.length} done</div>
      </div>
      <div className="task-list">
        {tasks.length === 0 && <div className="empty-tasks">No tasks yet — add one above.</div>}
        {tasks.map((task) => (
          <div className="task-row" key={task.id}>
            <button
              className={`task-check${task.done ? ' done' : ''}`}
              onClick={() => onToggle(task.id)}
              style={{ background: task.done ? 'var(--accent)' : 'transparent' }}
              aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.done ? '✓' : ''}
            </button>
            <div className={`task-label${task.done ? ' done' : ''}`}>{task.label}</div>
            <div className="task-tag" style={{ color: TAG_COLORS[task.tag] }}>{task.tag}</div>
            <button className="task-delete" onClick={() => onDelete(task.id)} aria-label="Delete task">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
