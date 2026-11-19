/**
 * What happens when a geofence fires. Runs in the background task, so it
 * reads everything it needs from storage.
 */
import { NOTIFY_COOLDOWN_MS, PLACE_ALERT_COOLDOWN_MS } from '../constants/config';
import { readPlaceAlertTime, recordPlaceAlertTime } from '../storage/fenceStateStorage';
import { readPlaces } from '../storage/placeStorage';
import { readNotificationSettings } from '../storage/settingsStorage';
import { readTasks, writeTasks } from '../storage/taskStorage';
import type { Coordinates, PlaceId } from '../types/place';
import { distanceMeters } from '../utils/geo';
import { hasLocation } from '../utils/task';
import { cancelRemindersAfterArrival } from './deadlineReminders';
import { showNearbyTasksNotification, showPlaceNotification } from './notifications';

/** Allows for rounding in the region the OS reports back. */
const MATCH_TOLERANCE_METERS = 25;

export type FiredRegion = Coordinates & { identifier: string; radius: number };

/**
 * Notifies about every open task inside the fence that isn't in its cooldown.
 * Tasks are matched by position, so no task-to-fence mapping is stored.
 */
export async function notifyNearbyTasks(region: FiredRegion) {
  const now = Date.now();
  const tasks = await readTasks();
  const nearby = tasks.filter(
    (task) =>
      !task.completed &&
      hasLocation(task) &&
      distanceMeters(region, task) <= region.radius + MATCH_TOLERANCE_METERS &&
      !(task.lastNotifiedAt && now - task.lastNotifiedAt < NOTIFY_COOLDOWN_MS),
  );
  if (nearby.length === 0) return;

  const nearbyIds = new Set(nearby.map((task) => task.id));
  const updated = tasks.map((task) =>
    nearbyIds.has(task.id) ? { ...task, lastNotifiedAt: now } : task,
  );
  await writeTasks(updated);
  await showNearbyTasksNotification(region.identifier, nearby);

  const settings = await readNotificationSettings();
  await Promise.all(
    updated
      .filter((task) => nearbyIds.has(task.id))
      .map((task) => cancelRemindersAfterArrival(task, settings)),
  );
}

/** Lists open tasks when arriving home or leaving work. */
export async function notifyPlace(place: PlaceId) {
  const now = Date.now();
  const lastAlert = await readPlaceAlertTime(place);
  if (lastAlert && now - lastAlert < PLACE_ALERT_COOLDOWN_MS) return;

  const [tasks, places, settings] = await Promise.all([
    readTasks(),
    readPlaces(),
    readNotificationSettings(),
  ]);
  const home = places.home;
  // Tasks located at Home get their own arrival notification, so leave them out.
  const isAtHome = (task: (typeof tasks)[number]) =>
    !!home && hasLocation(task) && distanceMeters(home, task) <= settings.home.radius;
  const open = tasks.filter((task) => !task.completed && !(place === 'home' && isAtHome(task)));
  if (open.length === 0) return;

  await recordPlaceAlertTime(place, now);
  await showPlaceNotification(place, open);
}
