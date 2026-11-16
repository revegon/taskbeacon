import { TASK_TYPES, type BeaconTask, type TaskType } from '../types/task';

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
