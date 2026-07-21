export type TaskTag = 'Work' | 'Health' | 'Meetings' | 'Personal';

export interface Task {
  id: number;
  label: string;
  done: boolean;
  tag: TaskTag;
}

export interface CalendarEvent {
  title: string;
  time: string;
  color: 'accent' | 'secondary' | 'tertiary';
}
