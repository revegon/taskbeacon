import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { saveNotificationSettings, syncSettingsWithDrive } from '../services/settingsSync';
import { readNotificationSettings } from '../storage/settingsStorage';
import type { NotificationSettings } from '../types/settings';

export type DriveSyncStatus = 'syncing' | 'synced' | 'offline';

/**
 * Notification settings for the settings screen. Loads the phone's copy
 * straight away, then syncs with Drive while the user is signed in.
 */
export function useNotificationSettings(isSignedIn: boolean) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [syncStatus, setSyncStatus] = useState<DriveSyncStatus>('syncing');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    readNotificationSettings()
      .then((stored) => {
        if (mounted) setSettings(stored);
      })
      .catch((error: unknown) => {
        console.error('TaskBeacon could not load notification settings.', error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    let mounted = true;
    syncSettingsWithDrive()
      .then((synced) => {
        if (!mounted) return;
        setSettings(synced);
        setSyncStatus('synced');
      })
      .catch((error: unknown) => {
        console.warn('TaskBeacon could not sync notification settings with Drive.', error);
        if (mounted) setSyncStatus('offline');
      });
    return () => {
      mounted = false;
    };
  }, [isSignedIn]);

  async function save(next: NotificationSettings) {
    setIsSaving(true);
    try {
      const result = await saveNotificationSettings(next);
      setSettings(result.settings);
      setSyncStatus(result.uploaded ? 'synced' : 'offline');
      Alert.alert(
        'Settings saved',
        result.uploaded
          ? 'Your reminders are updated and the settings are saved to Google Drive.'
          : 'Your reminders are updated. Drive could not be reached, so the settings will sync next time you open this page.',
      );
      return true;
    } catch (error) {
      console.error('TaskBeacon could not save notification settings.', error);
      Alert.alert('Could not save settings', 'Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { settings, syncStatus, isSaving, save };
}
