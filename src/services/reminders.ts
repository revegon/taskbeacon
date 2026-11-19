/**
 * Single entry point that brings every reminder in line with the stored
 * tasks, places and settings. Call it after any of them change.
 */
import * as Location from 'expo-location';

import { HOME_FENCE_ID, OFFICE_FENCE_ID, REPLAN_FENCE_ID } from '../constants/config';
import { pruneFenceStates } from '../storage/fenceStateStorage';
import { readPlaces } from '../storage/placeStorage';
import { readNotificationSettings } from '../storage/settingsStorage';
import { readTasks } from '../storage/taskStorage';
import type { Coordinates, SavedPlaces } from '../types/place';
import type { NotificationSettings } from '../types/settings';
import type { BeaconTask } from '../types/task';
import { hasLocation } from '../utils/task';
import { syncDeadlineReminders } from './deadlineReminders';
import { MAX_GEOFENCES, planTaskFences } from './fences/fencePlanner';
import { registerGeofences, type GeofenceRegion } from './geofencing';

export type SyncResult = {
  /** False when location reminders are needed but background location isn't allowed. */
  locationRemindersActive: boolean;
};

// Syncs run one after another, so two quick changes can't interleave their registrations.
let queue: Promise<unknown> = Promise.resolve();

export function syncReminders(): Promise<SyncResult> {
  const run = queue.then(runSync, runSync);
  queue = run.catch(() => undefined);
  return run;
}

async function runSync(): Promise<SyncResult> {
  const [tasks, places, settings] = await Promise.all([
    readTasks(),
    readPlaces(),
    readNotificationSettings(),
  ]);
  const openTasks = tasks.filter((task) => !task.completed);

  await syncDeadlineReminders(openTasks, settings);
  return { locationRemindersActive: await syncLocationReminders(openTasks, places, settings) };
}

function placeRegions(places: SavedPlaces, settings: NotificationSettings): GeofenceRegion[] {
  const regions: GeofenceRegion[] = [];
  if (places.home && settings.home.enabled) {
    regions.push({ identifier: HOME_FENCE_ID, ...places.home, radius: settings.home.radius });
  }
  if (places.office && settings.office.enabled) {
    regions.push({ identifier: OFFICE_FENCE_ID, ...places.office, radius: settings.office.radius });
  }
  return regions;
}

async function lastKnownPosition(): Promise<Coordinates | null> {
  try {
    const position = await Location.getLastKnownPositionAsync();
    return position
      ? { latitude: position.coords.latitude, longitude: position.coords.longitude }
      : null;
  } catch {
    return null;
  }
}

async function syncLocationReminders(
  openTasks: BeaconTask[],
  places: SavedPlaces,
  settings: NotificationSettings,
): Promise<boolean> {
  const fixedRegions = placeRegions(places, settings);
  const points = openTasks
    .filter(hasLocation)
    .map((task) => ({ taskId: task.id, latitude: task.latitude, longitude: task.longitude }));
  const needed = fixedRegions.length > 0 || points.length > 0;

  const permission = await Location.getBackgroundPermissionsAsync();
  if (!permission.granted) {
    await registerGeofences([]).catch(() => undefined);
    return !needed;
  }

  const plan = planTaskFences({
    points,
    taskRadius: settings.taskRadius,
    budget: MAX_GEOFENCES - fixedRegions.length,
    origin: points.length > 0 ? await lastKnownPosition() : null,
  });

  // Exits are watched too: they keep the inside/outside state that tells real arrivals apart.
  const regions: GeofenceRegion[] = [
    ...fixedRegions.map((region) => ({ ...region, notifyOnEnter: true, notifyOnExit: true })),
    ...plan.fences.map(({ identifier, latitude, longitude, radius }) => ({
      identifier,
      latitude,
      longitude,
      radius,
      notifyOnEnter: true,
      notifyOnExit: true,
    })),
  ];
  if (plan.replanBoundary) {
    regions.push({
      identifier: REPLAN_FENCE_ID,
      ...plan.replanBoundary,
      notifyOnEnter: false,
      notifyOnExit: true,
    });
  }

  await registerGeofences(regions);
  await pruneFenceStates(regions.map((region) => region.identifier));
  return true;
}
