export const STORAGE_KEY = 'taskbeacon.tasks';
export const PLACES_STORAGE_KEY = 'taskbeacon.places';
export const SETTINGS_STORAGE_KEY = 'taskbeacon.notificationSettings';
export const FENCE_STATES_STORAGE_KEY = 'taskbeacon.fenceStates';
export const PLACE_ALERTS_STORAGE_KEY = 'taskbeacon.placeAlerts';

export const GEOFENCE_TASK = 'taskbeacon.geofence';

/** Geofence identifiers. Task fences use `tasks:<id of the first task in the group>`. */
export const HOME_FENCE_ID = 'place:home';
export const OFFICE_FENCE_ID = 'place:office';
export const TASK_FENCE_PREFIX = 'tasks:';
/** iOS only: leaving this circle around the user re-picks the nearest task fences. */
export const REPLAN_FENCE_ID = 'replan';

/** Task locations closer than this share one geofence. */
export const FENCE_GROUP_DISTANCE_METERS = 50;

/** Minimum time between two arrival notifications for the same task. */
export const NOTIFY_COOLDOWN_MS = 30 * 60 * 1000;

/** Minimum time between two Home (or two Office) reminders. */
export const PLACE_ALERT_COOLDOWN_MS = 30 * 60 * 1000;

/** Deadline reminders due this soon after an arrival notification are skipped. */
export const ARRIVAL_QUIET_WINDOW_MS = 15 * 60 * 1000;

export const ANDROID_CHANNEL_ID = 'default';
