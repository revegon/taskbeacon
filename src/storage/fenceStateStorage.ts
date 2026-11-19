/**
 * Small bits of state the background geofence handler needs between events.
 * Both platforms report the current inside/outside state every time fences
 * are registered, so remembering the last state is what tells a real arrival
 * or departure apart from a re-registration.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FENCE_STATES_STORAGE_KEY, PLACE_ALERTS_STORAGE_KEY } from '../constants/config';
import type { PlaceId } from '../types/place';

export type FenceState = 'inside' | 'outside';

async function readJson<T>(key: string): Promise<T> {
  const stored = await AsyncStorage.getItem(key);
  return (stored ? JSON.parse(stored) : {}) as T;
}

/** Saves the new state of a fence and resolves to the state it had before, if known. */
export async function recordFenceState(
  identifier: string,
  state: FenceState,
): Promise<FenceState | undefined> {
  const states = await readJson<Record<string, FenceState>>(FENCE_STATES_STORAGE_KEY);
  const previous = states[identifier];
  states[identifier] = state;
  await AsyncStorage.setItem(FENCE_STATES_STORAGE_KEY, JSON.stringify(states));
  return previous;
}

/** Forgets fences that are no longer registered. */
export async function pruneFenceStates(registeredIds: string[]): Promise<void> {
  const states = await readJson<Record<string, FenceState>>(FENCE_STATES_STORAGE_KEY);
  const kept = Object.fromEntries(
    Object.entries(states).filter(([identifier]) => registeredIds.includes(identifier)),
  );
  await AsyncStorage.setItem(FENCE_STATES_STORAGE_KEY, JSON.stringify(kept));
}

export async function readPlaceAlertTime(place: PlaceId): Promise<number | undefined> {
  const times = await readJson<Partial<Record<PlaceId, number>>>(PLACE_ALERTS_STORAGE_KEY);
  return times[place];
}

export async function recordPlaceAlertTime(place: PlaceId, time: number): Promise<void> {
  const times = await readJson<Partial<Record<PlaceId, number>>>(PLACE_ALERTS_STORAGE_KEY);
  times[place] = time;
  await AsyncStorage.setItem(PLACE_ALERTS_STORAGE_KEY, JSON.stringify(times));
}
