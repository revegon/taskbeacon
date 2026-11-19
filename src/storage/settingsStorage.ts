import AsyncStorage from '@react-native-async-storage/async-storage';

import { SETTINGS_STORAGE_KEY } from '../constants/config';
import { normalizeSettings, type NotificationSettings } from '../types/settings';

/** The phone's copy is the source of truth; Drive only syncs it between devices. */
export async function readNotificationSettings(): Promise<NotificationSettings> {
  const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
  return normalizeSettings(stored ? JSON.parse(stored) : null);
}

export async function writeNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
