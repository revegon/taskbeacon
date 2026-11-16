export type TaskType = 'shopping' | 'visiting' | 'reminder';

export const TASK_TYPES: {
  id: TaskType;
  label: string;
  icon: 'shopping-bag' | 'users' | 'bell';
}[] = [
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { id: 'visiting', label: 'Visiting', icon: 'users' },
  { id: 'reminder', label: 'Reminder', icon: 'bell' },
];

export type BeaconTask = {
  id: string;
  title: string;
  taskDescription: string;
  taskType: TaskType;
  /** ISO 8601 date-time. Absent when the task has no deadline. */
  deadline?: string;
  /** Human-readable place label, shown in the list and in the arrival notification. */
  destination: string;
  latitude: number;
  longitude: number;
  completed: boolean;
  lastNotifiedAt?: number;
};

export type NewTaskInput = {
  title: string;
  taskDescription: string;
  taskType: TaskType;
  deadline?: Date;
  latitude: number;
  longitude: number;
  /** Saved place name (e.g. "Home"); falls back to the coordinates when absent. */
  placeLabel?: string;
};
