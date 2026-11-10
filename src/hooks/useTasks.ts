import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { MAX_ACTIVE_TASKS } from '../constants/config';
import { syncGeofences } from '../services/geofencing';
import { ensureReminderPermissions } from '../services/permissions';
import { readTasks, writeTasks } from '../storage/taskStorage';
import type { BeaconTask, NewTaskInput } from '../types/task';
import { formatCoordinates } from '../utils/coordinates';

/** Owns the task list: loading, persisting, geofence sync, add and toggle. */
export function useTasks() {
  const [tasks, setTasks] = useState<BeaconTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Reload on focus so changes from elsewhere (a Drive restore, the background
  // geofence task) show up when the user comes back to this screen.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadTasks() {
        try {
          const storedTasks = await readTasks();
          if (mounted) setTasks(storedTasks);
        } catch (error) {
          console.error('TaskBeacon could not load saved tasks.', error);
          Alert.alert('Could not load tasks', 'Please restart the app and try again.');
        } finally {
          if (mounted) setIsLoading(false);
        }
      }

      void loadTasks();
      return () => {
        mounted = false;
      };
    }, []),
  );

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  async function saveTasks(nextTasks: BeaconTask[]) {
    await syncGeofences(nextTasks);
    await writeTasks(nextTasks);
    setTasks(nextTasks);
  }

  /** Resolves to true when the reminder was saved. */
  async function addTask({ title, latitude, longitude, placeLabel }: NewTaskInput): Promise<boolean> {
    if (activeTasks.length >= MAX_ACTIVE_TASKS) {
      Alert.alert(
        'Reminder limit reached',
        `You can set arrival reminders for up to ${MAX_ACTIVE_TASKS} active tasks.`,
      );
      return false;
    }

    setIsSaving(true);
    try {
      if (!(await ensureReminderPermissions())) return false;

      const newTask: BeaconTask = {
        id: `${Date.now()}`,
        title,
        destination: placeLabel ?? formatCoordinates(latitude, longitude),
        latitude,
        longitude,
        completed: false,
      };
      await saveTasks([newTask, ...tasks]);
      return true;
    } catch (error) {
      console.error('TaskBeacon could not create the arrival reminder.', error);
      Alert.alert(
        'Could not set the reminder',
        error instanceof Error ? error.message : 'Please try again.',
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleTask(task: BeaconTask) {
    try {
      const nextTasks = tasks.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item,
      );
      await saveTasks(nextTasks);
    } catch (error) {
      console.error('TaskBeacon could not update a task.', error);
      Alert.alert('Could not update task', 'Please try again.');
    }
  }

  return { activeTasks, completedTasks, isLoading, isSaving, addTask, toggleTask };
}
