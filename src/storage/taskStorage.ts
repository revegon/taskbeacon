import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY } from '../constants/config';
import type { BeaconTask } from '../types/task';

export async function readTasks(): Promise<BeaconTask[]> {
  const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
  return storedTasks ? (JSON.parse(storedTasks) as BeaconTask[]) : [];
}

export async function writeTasks(tasks: BeaconTask[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
