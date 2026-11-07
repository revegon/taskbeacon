import * as Location from 'expo-location';

import { GEOFENCE_RADIUS_METERS, GEOFENCE_TASK, MAX_ACTIVE_TASKS } from '../constants/config';
import type { BeaconTask } from '../types/task';

/** Replaces the monitored regions with one geofence per active task. */
export async function syncGeofences(tasks: BeaconTask[]) {
  const regions = tasks
    .filter((task) => !task.completed)
    .map((task) => ({
      identifier: task.id,
      latitude: task.latitude,
      longitude: task.longitude,
      radius: GEOFENCE_RADIUS_METERS,
      notifyOnEnter: true,
      notifyOnExit: false,
    }));

  if (regions.length > MAX_ACTIVE_TASKS) {
    throw new Error(`You can set arrival reminders for up to ${MAX_ACTIVE_TASKS} active tasks.`);
  }

  if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
  if (regions.length > 0) {
    await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
  }
}
