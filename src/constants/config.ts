export const STORAGE_KEY = 'taskbeacon.tasks';
export const GEOFENCE_TASK = 'taskbeacon.geofence';
export const GEOFENCE_RADIUS_METERS = 150;

/** Android and iOS both cap the number of monitored geofence regions per app. */
export const MAX_ACTIVE_TASKS = 20;

/** Minimum time between two arrival notifications for the same task. */
export const NOTIFY_COOLDOWN_MS = 30 * 60 * 1000;

export const ANDROID_CHANNEL_ID = 'default';
