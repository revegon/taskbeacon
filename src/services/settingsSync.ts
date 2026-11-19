/**
 * Notification settings live on the phone and are mirrored to a separate
 * file in the user's Drive app folder. The newer copy (by updatedAt) wins.
 */
import { readNotificationSettings, writeNotificationSettings } from '../storage/settingsStorage';
import { normalizeSettings, type NotificationSettings } from '../types/settings';
import { downloadFile, findSettingsFile, uploadSettingsFile } from './googleDrive';
import { syncReminders } from './reminders';

/** Pulls newer settings from Drive, or pushes local edits Drive hasn't seen yet. */
export async function syncSettingsWithDrive(): Promise<NotificationSettings> {
  const local = await readNotificationSettings();
  const file = await findSettingsFile();

  if (file) {
    const remote = normalizeSettings(JSON.parse(await downloadFile(file.id)));
    const remoteIsNewer =
      remote.updatedAt !== null && (local.updatedAt === null || remote.updatedAt > local.updatedAt);
    if (remoteIsNewer) {
      await writeNotificationSettings(remote);
      await syncReminders();
      return remote;
    }
    if (remote.updatedAt === local.updatedAt) return local;
  }

  if (local.updatedAt !== null) await uploadSettingsFile(JSON.stringify(local));
  return local;
}

export type SaveSettingsResult = {
  settings: NotificationSettings;
  /** False when the settings were saved on the phone but Drive couldn't be reached. */
  uploaded: boolean;
};

/** Saves on the phone first, applies the reminders, then uploads to Drive. */
export async function saveNotificationSettings(
  next: NotificationSettings,
): Promise<SaveSettingsResult> {
  const settings = { ...next, updatedAt: new Date().toISOString() };
  await writeNotificationSettings(settings);
  await syncReminders();
  try {
    await uploadSettingsFile(JSON.stringify(settings));
    return { settings, uploaded: true };
  } catch (error) {
    console.warn('TaskBeacon saved settings locally but could not upload them.', error);
    return { settings, uploaded: false };
  }
}
