import AsyncStorage from '@react-native-async-storage/async-storage';

import { PLACES_STORAGE_KEY } from '../constants/config';
import type { SavedPlaces } from '../types/place';

export async function readPlaces(): Promise<SavedPlaces> {
  const storedPlaces = await AsyncStorage.getItem(PLACES_STORAGE_KEY);
  return storedPlaces ? (JSON.parse(storedPlaces) as SavedPlaces) : {};
}

export async function writePlaces(places: SavedPlaces): Promise<void> {
  await AsyncStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
}
