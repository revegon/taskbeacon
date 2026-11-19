import * as Location from 'expo-location';

import { GEOFENCE_TASK } from '../constants/config';

export type GeofenceRegion = Location.LocationRegion & { identifier: string };

/** Replaces all monitored regions. Calling start again swaps the regions in place. */
export async function registerGeofences(regions: GeofenceRegion[]) {
  if (regions.length === 0) {
    if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
    }
    return;
  }
  await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
}
