/** Read at build time from .env.local (see .env.example). */
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;

/**
 * Access to a hidden, app-only folder in the user's Drive. The app can't see
 * any of the user's other files, and the user doesn't see clutter in their Drive.
 */
export const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

export const BACKUP_FILE_NAME = 'taskbeacon-backup.json';
