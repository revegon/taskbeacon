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
  /** Human-readable place label. Absent when the task has no location. */
  destination?: string;
  /** Latitude and longitude are both set, or both absent. */
  latitude?: number;
  longitude?: number;
  completed: boolean;
  /** When the last arrival notification for this task was shown (ms since epoch). */
  lastNotifiedAt?: number;
};

/** A task that has a location, so it can have an arrival geofence. */
export type LocatedTask = BeaconTask & { latitude: number; longitude: number };

export type NewTaskInput = {
  title: string;
  taskDescription: string;
  taskType: TaskType;
  deadline?: Date;
  /** Both set for a located task, both absent otherwise. */
  latitude?: number;
  longitude?: number;
  /** Saved place name (e.g. "Home"); falls back to the coordinates when absent. */
  placeLabel?: string;
};
