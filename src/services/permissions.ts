import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { promptForSettings } from '../utils/settings';
import { ensureAndroidChannel } from './notifications';

/**
 * Requests everything arrival reminders need, in order. If one is refused,
 * offers to open system settings and resolves to false.
 */
export async function ensureReminderPermissions(): Promise<boolean> {
  const locationPermission = await Location.requestForegroundPermissionsAsync();
  if (locationPermission?.status !== 'granted') {
    promptForSettings(
      'Location permission needed',
      'Enable location access in system settings to set up arrival reminders.',
    );
    return false;
  }

  const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
  if (backgroundPermission?.status !== 'granted') {
    promptForSettings(
      'Background location needed',
      'Enable background location in system settings so TaskBeacon can notify you when you arrive, even when the app is closed.',
    );
    return false;
  }

  // On Android 13+ the notification prompt only appears once a channel exists.
  await ensureAndroidChannel();

  const notificationPermission = await Notifications.requestPermissionsAsync();
  if (!notificationPermission?.granted) {
    promptForSettings(
      'Notifications are off',
      'Enable notifications in system settings to receive arrival reminders.',
    );
    return false;
  }

  return true;
}
