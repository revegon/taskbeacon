/**
 * Background geofence handler. It is imported from the app entry (index.ts)
 * so the task is defined in global scope before the app renders, including
 * when the OS wakes the app in the background.
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { GEOFENCE_TASK, NOTIFY_COOLDOWN_MS } from '../constants/config';
import { showArrivalNotification } from '../services/notifications';
import { readTasks, writeTasks } from '../storage/taskStorage';

type GeofenceTaskData = {
  eventType: Location.GeofencingEventType;
  region: { identifier?: string };
};

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.error('TaskBeacon could not process a location reminder.', error);
    return;
  }

  const event = data as GeofenceTaskData | undefined;
  if (
    !event ||
    event.eventType !== Location.GeofencingEventType.Enter ||
    !event.region.identifier
  ) {
    return;
  }

  try {
    const tasks = await readTasks();
    const task = tasks.find((item) => item.id === event.region.identifier && !item.completed);

    if (!task || (task.lastNotifiedAt && Date.now() - task.lastNotifiedAt < NOTIFY_COOLDOWN_MS)) {
      return;
    }

    const updatedTasks = tasks.map((item) =>
      item.id === task.id ? { ...item, lastNotifiedAt: Date.now() } : item,
    );
    await writeTasks(updatedTasks);
    await showArrivalNotification(task);
  } catch (taskError) {
    console.error('TaskBeacon could not save a location reminder.', taskError);
  }
});
