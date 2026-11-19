import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { ANDROID_CHANNEL_ID } from '../constants/config';
import type { PlaceId } from '../types/place';
import type { BeaconTask } from '../types/task';
import { describeTaskLine, formatOffset } from '../utils/task';

/** Grouped notifications list at most this many tasks, then "and N more". */
const MAX_LISTED_TASKS = 5;

/** Shows notifications as banners even while the app is in the foreground. */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Task reminders',
      importance: AndroidImportance.DEFAULT,
    });
  } catch (channelError) {
    // Some Android runtimes (e.g. Expo Go) throw a native NullPointerException here.
    // Reminders are scheduled without a channelId, so they still use the fallback
    // channel; creating this one is not required to save the reminder.
    console.warn('TaskBeacon could not create the Android notification channel.', channelError);
  }
}

function listTasks(tasks: BeaconTask[]) {
  const lines = tasks.slice(0, MAX_LISTED_TASKS).map(describeTaskLine);
  const hidden = tasks.length - MAX_LISTED_TASKS;
  if (hidden > 0) lines.push(`and ${hidden} more`);
  return lines.join('\n');
}

/**
 * One notification per fence. The fixed identifier makes a repeat replace the
 * earlier notification instead of stacking a second one.
 */
export async function showNearbyTasksNotification(fenceId: string, tasks: BeaconTask[]) {
  const [first] = tasks;
  const single = tasks.length === 1;
  await Notifications.scheduleNotificationAsync({
    identifier: `fence:${fenceId}`,
    content: {
      title: single
        ? `You're near ${first.destination ?? 'your task'}`
        : `${tasks.length} tasks nearby`,
      body: single
        ? [describeTaskLine(first), first.taskDescription].filter(Boolean).join('\n')
        : listTasks(tasks),
    },
    trigger: null,
  });
}

/** Lists open tasks when arriving home or leaving work. */
export async function showPlaceNotification(place: PlaceId, tasks: BeaconTask[]) {
  const count = `${tasks.length} open task${tasks.length === 1 ? '' : 's'}`;
  await Notifications.scheduleNotificationAsync({
    identifier: `place:${place}`,
    content: {
      title: place === 'home' ? `Almost home · ${count}` : `Leaving work · ${count}`,
      body: listTasks(tasks),
    },
    trigger: null,
  });
}

export function deadlineNotificationContent(
  task: BeaconTask,
  offsetMinutes: number,
): Notifications.NotificationContentInput {
  return {
    title: `Due in ${formatOffset(offsetMinutes)}: ${task.title}`,
    body: [task.taskDescription, task.destination && `At ${task.destination}`]
      .filter(Boolean)
      .join('\n'),
  };
 }
