import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { readPlaces, writePlaces } from '../storage/placeStorage';
import type { Coordinates, PlaceId, SavedPlaces } from '../types/place';

/**
 * Saved Home/Office coordinates. Reloads whenever the screen using it gains
 * focus, so edits made on the Places tab show up on the Tasks tab.
 */
export function usePlaces() {
  const [places, setPlaces] = useState<SavedPlaces>({});
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      readPlaces()
        .then((stored) => {
          if (active) setPlaces(stored);
        })
        .catch((error: unknown) => {
          console.error('TaskBeacon could not load saved places.', error);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  async function persist(nextPlaces: SavedPlaces) {
    try {
      await writePlaces(nextPlaces);
      setPlaces(nextPlaces);
      return true;
    } catch (error) {
      console.error('TaskBeacon could not save places.', error);
      Alert.alert('Could not save the place', 'Please try again.');
      return false;
    }
  }

  function savePlace(id: PlaceId, coordinates: Coordinates) {
    return persist({ ...places, [id]: coordinates });
  }

  function clearPlace(id: PlaceId) {
    const nextPlaces = { ...places };
    delete nextPlaces[id];
    return persist(nextPlaces);
  }

  return { places, isLoading, savePlace, clearPlace };
}
