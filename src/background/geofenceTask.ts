/**
 * Background geofence handler. It is imported from the app entry (index.ts)
 * so the task is defined in global scope before the app renders, including
 * when the OS wakes the app in the background.
 *
 * Both platforms report the current state of every fence when fences are
 * registered (Android even reports exits for fences you are outside of).
 * The last known state per fence is stored, so only real transitions notify.
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import {
  GEOFENCE_TASK,
  HOME_FENCE_ID,
  OFFICE_FENCE_ID,
  REPLAN_FENCE_ID,
} from '../constants/config';
import { notifyNearbyTasks, notifyPlace, type FiredRegion } from '../services/fenceEvents';
import { syncReminders } from '../services/reminders';
import { recordFenceState } from '../storage/fenceStateStorage';

type GeofenceTaskData = {
  eventType: Location.GeofencingEventType;
  region: Partial<FiredRegion>;
};

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.error('TaskBeacon could not process a location reminder.', error);
    return;
  }

  const event = data as GeofenceTaskData | undefined;
  const region = event?.region;
  if (
    !event ||
    !region?.identifier ||
    region.latitude === undefined ||
    region.longitude === undefined ||
    region.radius === undefined
  ) {
    return;
  }

  try {
    const entered = event.eventType === Location.GeofencingEventType.Enter;
    const previous = await recordFenceState(region.identifier, entered ? 'inside' : 'outside');

    switch (region.identifier) {
      case REPLAN_FENCE_ID:
        // iOS only: the user moved far enough that other task fences may now be nearest.
        if (!entered) await syncReminders();
        return;
      case HOME_FENCE_ID:
        // An unknown previous state means this is the first report after registering.
        if (entered && previous === 'outside') await notifyPlace('home');
        return;
      case OFFICE_FENCE_ID:
        if (!entered && previous === 'inside') await notifyPlace('office');
        return;
      default:
        // A task fence. Unknown counts as outside, so a new fence the user is
        // already inside still notifies once; the per-task cooldown limits repeats.
        if (entered && previous !== 'inside') {
          await notifyNearbyTasks({
            identifier: region.identifier,
            latitude: region.latitude,
            longitude: region.longitude,
            radius: region.radius,
          });
        }
    }
  } catch (taskError) {
    console.error('TaskBeacon could not handle a location reminder.', taskError);
  }
});
