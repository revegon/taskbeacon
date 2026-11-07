import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { ANDROID_CHANNEL_ID } from '../constants/config';
import type { BeaconTask } from '../types/task';

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
      name: 'Arrival reminders',
      importance: AndroidImportance.DEFAULT,
    });
  } catch (channelError) {
    // Some Android runtimes (e.g. Expo Go) throw a native NullPointerException here.
    // Reminders are scheduled without a channelId, so they still use the fallback
    // channel; creating this one is not required to save the reminder.
    console.warn('TaskBeacon could not create the Android notification channel.', channelError);
  }
}

export async function showArrivalNotification(task: BeaconTask) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `You're near ${task.destination}`,
      body: `A nearby reminder: ${task.title}`,
    },
    trigger: null,
  });
}
