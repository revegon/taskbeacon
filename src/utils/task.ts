import { TASK_TYPES, type BeaconTask, type LocatedTask, type TaskType } from '../types/task';

const DEFAULT_TASK_TYPE: TaskType = 'reminder';

/**
 * Fills fields added after the first release, so tasks saved by older
 * versions (on the phone or in a Drive backup) still load.
 */
export function normalizeTask(raw: BeaconTask): BeaconTask {
  const partial = raw as Partial<BeaconTask> & BeaconTask;
  return {
    ...partial,
    taskDescription: partial.taskDescription ?? '',
    taskType: TASK_TYPES.some((type) => type.id === partial.taskType)
      ? partial.taskType
      : DEFAULT_TASK_TYPE,
  };
}

export function hasLocation(task: BeaconTask): task is LocatedTask {
  return typeof task.latitude === 'number' && typeof task.longitude === 'number';
}

export function getTaskTypeLabel(type: TaskType) {
  return TASK_TYPES.find((item) => item.id === type)?.label ?? 'Reminder';
}

export function formatDeadline(isoOrDate: string | Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoOrDate));
}

export function isOverdue(task: BeaconTask, now = Date.now()) {
  return !task.completed && !!task.deadline && new Date(task.deadline).getTime() < now;
}

/** 4320 -> "3 days", 1440 -> "24 hours", 60 -> "1 hour", 30 -> "30 minutes". */
export function formatOffset(minutes: number) {
  const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;
  if (minutes >= 2 * 1440 && minutes % 1440 === 0) return plural(minutes / 1440, 'day');
  if (minutes % 60 === 0) return plural(minutes / 60, 'hour');
  return plural(minutes, 'minute');
}

/** One line per task for grouped notifications, e.g. "Shopping: Milk · due Nov 18, 5:00 PM". */
export function describeTaskLine(task: BeaconTask) {
  const due = task.deadline ? ` · due ${formatDeadline(task.deadline)}` : '';
  return `${getTaskTypeLabel(task.taskType)}: ${task.title}${due}`;
}
