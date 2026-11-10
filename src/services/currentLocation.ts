import * as Location from 'expo-location';

import type { Coordinates } from '../types/place';
import { promptForSettings } from '../utils/settings';

/** Returns the device's current position, or null if permission was refused. */
export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission?.status !== 'granted') {
    promptForSettings(
      'Location permission needed',
      'Enable location access in system settings to use your current location.',
    );
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}
