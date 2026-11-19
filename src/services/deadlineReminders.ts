/**
 * Deadline reminders are scheduled notifications, delivered by the OS even
 * when the app isn't running. They are rebuilt from the open tasks on every
 * sync, so nothing about them needs to be stored.
 */
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

import { ARRIVAL_QUIET_WINDOW_MS } from '../constants/config';
import type { NotificationSettings } from '../types/settings';
import type { BeaconTask } from '../types/task';
import { deadlineNotificationContent } from './notifications';

const DEADLINE_PREFIX = 'deadline:';

/**
 * iOS keeps at most 64 pending notifications per app, so only the soonest are
 * scheduled and the rest are topped up on later syncs (every app start and
 * task change). Android's practical limit is far higher.
 */
const MAX_SCHEDULED = Platform.OS === 'ios' ? 60 : 400;

const reminderId = (taskId: string, offsetMinutes: number) =>
  `${DEADLINE_PREFIX}${taskId}:${offsetMinutes}`;

function fireTime(task: BeaconTask, offsetMinutes: number) {
  return new Date(task.deadline as string).getTime() - offsetMinutes * 60 * 1000;
}

/** A deadline reminder due within 15 minutes after an arrival notification is skipped. */
function isQuietAfterArrival(task: BeaconTask, time: number) {
  if (task.lastNotifiedAt === undefined) return false;
  const sinceArrival = time - task.lastNotifiedAt;
  return sinceArrival >= 0 && sinceArrival <= ARRIVAL_QUIET_WINDOW_MS;
}

export async function syncDeadlineReminders(
  openTasks: BeaconTask[],
  settings: NotificationSettings,
) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith(DEADLINE_PREFIX))
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );

  const now = Date.now();
  const due = openTasks
    .filter((task) => task.deadline)
    .flatMap((task) =>
      settings.deadlineOffsetsMinutes.map((offset) => ({
        task,
        offset,
        time: fireTime(task, offset),
      })),
    )
    .filter(({ task, time }) => time > now + 5000 && !isQuietAfterArrival(task, time))
    .sort((a, b) => a.time - b.time)
    .slice(0, MAX_SCHEDULED);

  for (const { task, offset, time } of due) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminderId(task.id, offset),
      content: deadlineNotificationContent(task, offset),
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: time },
    });
  }
}

/** Called right after an arrival notification for `task`. */
export async function cancelRemindersAfterArrival(
  task: BeaconTask,
  settings: NotificationSettings,
) {
  if (!task.deadline) return;
  await Promise.all(
    settings.deadlineOffsetsMinutes
      .filter((offset) => isQuietAfterArrival(task, fireTime(task, offset)))
      .map((offset) => Notifications.cancelScheduledNotificationAsync(reminderId(task.id, offset))),
  );
}
