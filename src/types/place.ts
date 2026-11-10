export type PlaceId = 'home' | 'office';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/** Saved coordinates per place. A missing key means the place isn't set yet. */
export type SavedPlaces = Partial<Record<PlaceId, Coordinates>>;

export const PLACE_DEFINITIONS: { id: PlaceId; label: string; icon: 'home' | 'briefcase' }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'office', label: 'Office', icon: 'briefcase' },
];
