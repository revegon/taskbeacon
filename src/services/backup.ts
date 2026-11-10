import { readPlaces, writePlaces } from '../storage/placeStorage';
import { readTasks, writeTasks } from '../storage/taskStorage';
import type { SavedPlaces } from '../types/place';
import type { BeaconTask } from '../types/task';
import { syncGeofences } from './geofencing';
import { downloadFile, findBackupFile, uploadBackupFile } from './googleDrive';

const BACKUP_VERSION = 1;

type BackupData = {
  version: number;
  exportedAt: string;
  tasks: BeaconTask[];
  places: SavedPlaces;
};

/** When the Drive backup was last written, or null if there is none. */
export async function getLastBackupTime(): Promise<string | null> {
  const file = await findBackupFile();
  return file?.modifiedTime ?? null;
}

/** Uploads all local tasks and places. Resolves to the backup's timestamp. */
export async function backUpToDrive(): Promise<string> {
  const data: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tasks: await readTasks(),
    places: await readPlaces(),
  };
  const file = await uploadBackupFile(JSON.stringify(data));
  return file.modifiedTime;
}

export type RestoreResult = {
  taskCount: number;
  /** False when geofences couldn't start, usually because location permission is missing. */
  remindersActive: boolean;
};

/** Replaces local tasks and places with the Drive backup. */
export async function restoreFromDrive(): Promise<RestoreResult> {
  const file = await findBackupFile();
  if (!file) throw new Error('There is no TaskBeacon backup in this Google account yet.');

  const data = parseBackup(await downloadFile(file.id));
  await writeTasks(data.tasks);
  await writePlaces(data.places);

  let remindersActive = true;
  try {
    await syncGeofences(data.tasks);
  } catch (error) {
    console.warn('TaskBeacon restored data but could not start arrival reminders.', error);
    remindersActive = false;
  }
  return { taskCount: data.tasks.length, remindersActive };
}

function parseBackup(raw: string): BackupData {
  const data = JSON.parse(raw) as Partial<BackupData>;
  if (typeof data.version !== 'number' || !Array.isArray(data.tasks)) {
    throw new Error('The backup in Google Drive is not in a format TaskBeacon recognizes.');
  }
  if (data.version > BACKUP_VERSION) {
    throw new Error('This backup was made by a newer version of TaskBeacon. Update the app first.');
  }
  return {
    version: data.version,
    exportedAt: data.exportedAt ?? '',
    tasks: data.tasks,
    places: data.places ?? {},
  };
}
