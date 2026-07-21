'use client';

import { useEffect, useRef, useState } from 'react';
import { NavBar, type NavKey } from '@/components/NavBar';
import { CalendarCard } from '@/components/CalendarCard';
import { UpcomingEvents } from '@/components/UpcomingEvents';
import { TaskList } from '@/components/TaskList';
import { CompletionRing } from '@/components/CompletionRing';
import { StreakChart } from '@/components/StreakChart';
import { GoalProgress } from '@/components/GoalProgress';
import type { CalendarEvent, Task } from '@/lib/types';

const STORAGE_KEY = 'fieldwork-tasks';

const DEFAULT_TASKS: Task[] = [
  { id: 1, label: 'Finalize Q3 roadmap deck', done: true, tag: 'Work' },
  { id: 2, label: 'Morning run — 5k', done: true, tag: 'Health' },
  { id: 3, label: 'Review design system PR', done: false, tag: 'Work' },
  { id: 4, label: 'Call with Alex re: onboarding', done: false, tag: 'Meetings' },
  { id: 5, label: 'Read 20 pages', done: false, tag: 'Personal' },
];

const UPCOMING_EVENTS: CalendarEvent[] = [
  { title: 'Design review', time: 'Today, 2:00 PM', color: 'accent' },
  { title: '1:1 with manager', time: 'Tomorrow, 10:00 AM', color: 'secondary' },
  { title: 'Team standup', time: 'Thu, 9:30 AM', color: 'tertiary' },
];

function greetingFor(date: Date) {
  const hour = date.getHours();
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return `Good ${part}, Sam`;
}

interface CalendarState {
  today: Date;
  viewYear: number;
  viewMonth: number;
  selectedDay: number;
}

function initialCalendarState(): CalendarState {
  const now = new Date();
  return { today: now, viewYear: now.getFullYear(), viewMonth: now.getMonth(), selectedDay: now.getDate() };
}

export default function Home() {
  // Real time only exists client-side; calendar is null until mounted to
  // avoid a server/client hydration mismatch.
  const [calendar, setCalendar] = useState<CalendarState | null>(null);
  const [activeNav, setActiveNav] = useState<NavKey>('dashboard');

  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [taskInput, setTaskInput] = useState('');
  const nextIdRef = useRef(DEFAULT_TASKS.length + 1);
  const loadedFromStorage = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client mount sync
    setCalendar(initialCalendarState());

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Task[] = JSON.parse(saved);
        setTasks(parsed);
        nextIdRef.current = parsed.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      } catch {
        // ignore malformed storage
      }
    }
    loadedFromStorage.current = true;
  }, []);

  useEffect(() => {
    if (!loadedFromStorage.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  if (!calendar) return null;
  const { today, viewYear, viewMonth, selectedDay } = calendar;

  const addTask = () => {
    const label = taskInput.trim();
    if (!label) return;
    setTasks((prev) => [...prev, { id: nextIdRef.current++, label, done: false, tag: 'Personal' }]);
    setTaskInput('');
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const setSelectedDay = (day: number) => setCalendar((c) => (c ? { ...c, selectedDay: day } : c));

  const prevMonth = () => {
    setCalendar((c) => {
      if (!c) return c;
      const atStart = c.viewMonth === 0;
      return { ...c, viewMonth: atStart ? 11 : c.viewMonth - 1, viewYear: atStart ? c.viewYear - 1 : c.viewYear };
    });
  };

  const nextMonth = () => {
    setCalendar((c) => {
      if (!c) return c;
      const atEnd = c.viewMonth === 11;
      return { ...c, viewMonth: atEnd ? 0 : c.viewMonth + 1, viewYear: atEnd ? c.viewYear + 1 : c.viewYear };
    });
  };

  const navigate = (key: NavKey) => {
    setActiveNav(key);
    if (key === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const eventDays = new Set(
    [today.getDate(), today.getDate() + 2, today.getDate() + 6].filter((d) => d <= 31)
  );
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div className="app-shell">
      <NavBar active={activeNav} onNavigate={navigate} focusHours={3.5} />

      <div className="content">
        <div className="header-row">
          <div>
            <div className="greeting">{greetingFor(today)}</div>
            <div className="date-label">
              {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="input-row">
            <input
              className="task-input"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a task and press enter"
            />
            <div className="avatar">SC</div>
          </div>
        </div>

        <div className="dash-grid">
          <CalendarCard
            viewYear={viewYear}
            viewMonth={viewMonth}
            selectedDay={selectedDay}
            today={today}
            eventDays={eventDays}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onSelectDay={setSelectedDay}
          />
          <UpcomingEvents events={UPCOMING_EVENTS} />
        </div>

        <div className="dash-grid">
          <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
          <div className="side-col">
            <CompletionRing completedCount={completedCount} totalCount={tasks.length} />
            <StreakChart activeDays={5} />
            <GoalProgress title="Q3 Goal: Ship redesign" pct={62} />
          </div>
        </div>
      </div>
    </div>
  );
}
