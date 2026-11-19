import type { PlaceId } from './place';

export type PlaceReminderSetting = {
  enabled: boolean;
  /** Geofence radius around the saved place, in meters. */
  radius: number;
};

export type NotificationSettings = {
  /** Reminder of all open tasks when arriving near Home. */
  home: PlaceReminderSetting;
  /** Reminder of all open tasks when leaving the Office. */
  office: PlaceReminderSetting;
  /** How close to a task's place counts as "arrived", in meters. */
  taskRadius: number;
  /** Deadline reminders, as minutes before the deadline. */
  deadlineOffsetsMinutes: number[];
  /** ISO time of the last edit, or null for untouched defaults. Used to sync with Drive. */
  updatedAt: string | null;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  home: { enabled: true, radius: 150 },
  office: { enabled: true, radius: 150 },
  taskRadius: 150,
  deadlineOffsetsMinutes: [3 * 1440, 1440, 720, 360, 180, 60],
  updatedAt: null,
};

export const RADIUS_OPTIONS = [100, 150, 200, 300];

export const DEADLINE_OFFSET_OPTIONS = [7 * 1440, 3 * 1440, 1440, 720, 360, 180, 60, 30];

export const PLACE_REMINDER_COPY: Record<PlaceId, { title: string; hint: string }> = {
  home: { title: 'Arriving home', hint: 'Lists your open tasks as you get close to Home.' },
  office: { title: 'Leaving work', hint: 'Lists your open tasks as you leave the Office.' },
};

function validRadius(value: unknown, fallback: number) {
  return typeof value === 'number' && value >= 50 && value <= 1000 ? value : fallback;
}

function normalizePlaceSetting(raw: unknown, fallback: PlaceReminderSetting): PlaceReminderSetting {
  const value = (raw ?? {}) as Partial<PlaceReminderSetting>;
  return {
    enabled: typeof value.enabled === 'boolean' ? value.enabled : fallback.enabled,
    radius: validRadius(value.radius, fallback.radius),
  };
}

/** Fills missing or invalid fields with defaults, for settings read from storage or Drive. */
export function normalizeSettings(raw: unknown): NotificationSettings {
  const value = (raw ?? {}) as Partial<NotificationSettings>;
  const defaults = DEFAULT_NOTIFICATION_SETTINGS;
  const offsets = Array.isArray(value.deadlineOffsetsMinutes)
    ? value.deadlineOffsetsMinutes.filter((item) => typeof item === 'number' && item > 0)
    : defaults.deadlineOffsetsMinutes;
  return {
    home: normalizePlaceSetting(value.home, defaults.home),
    office: normalizePlaceSetting(value.office, defaults.office),
    taskRadius: validRadius(value.taskRadius, defaults.taskRadius),
    deadlineOffsetsMinutes: [...new Set(offsets)].sort((a, b) => b - a),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
  };
}
