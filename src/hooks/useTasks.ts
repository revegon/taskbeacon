import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { ensureReminderPermissions } from '../services/permissions';
import { syncReminders } from '../services/reminders';
import { readPlaces } from '../storage/placeStorage';
import { readTasks, writeTasks } from '../storage/taskStorage';
import type { BeaconTask, NewTaskInput } from '../types/task';
import { formatCoordinates } from '../utils/coordinates';

/** Owns the task list: loading, persisting, reminder sync, add and toggle. */
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

  /** Saves first, so a reminder problem never loses the task itself. */
  async function saveTasks(nextTasks: BeaconTask[]) {
    await writeTasks(nextTasks);
    setTasks(nextTasks);
    try {
      await syncReminders();
    } catch (error) {
      console.error('TaskBeacon saved the tasks but could not update reminders.', error);
      Alert.alert('Reminders not updated', 'Your task is saved. Reopen the app to retry.');
    }
  }

  /** Resolves to true when the task was saved. */
  async function addTask({
    title,
    taskDescription,
    taskType,
    deadline,
    latitude,
    longitude,
    placeLabel,
  }: NewTaskInput): Promise<boolean> {
    setIsSaving(true);
    try {
      const located = latitude !== undefined && longitude !== undefined;
      const places = await readPlaces();
      const usesPlaces = places.home !== undefined || places.office !== undefined;
      if (!(await ensureReminderPermissions({ needsLocation: located || usesPlaces }))) {
        return false;
      }

      const newTask: BeaconTask = {
        id: `${Date.now()}`,
        title,
        taskDescription,
        taskType,
        deadline: deadline?.toISOString(),
        ...(located && {
          destination: placeLabel ?? formatCoordinates(latitude, longitude),
          latitude,
          longitude,
        }),
        completed: false,
      };
      await saveTasks([newTask, ...tasks]);
      return true;
    } catch (error) {
      console.error('TaskBeacon could not save the task.', error);
      Alert.alert(
        'Could not save the task',
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
