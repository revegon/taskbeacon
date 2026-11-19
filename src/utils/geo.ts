import type { Coordinates } from '../types/place';

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance between two points, in meters. */
export function distanceMeters(a: Coordinates, b: Coordinates) {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Average of nearby points. Accurate enough for points a few hundred meters apart. */
export function centerOf(points: Coordinates[]): Coordinates {
  const sum = points.reduce(
    (total, point) => ({
      latitude: total.latitude + point.latitude,
      longitude: total.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );
  return { latitude: sum.latitude / points.length, longitude: sum.longitude / points.length };
}
