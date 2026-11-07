export type CoordinateParseResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; title: string; message: string };

/** Validates the raw latitude/longitude text typed by the user. */
export function parseCoordinates(
  latitudeText: string,
  longitudeText: string,
): CoordinateParseResult {
  const latitude = Number(latitudeText.trim());
  const longitude = Number(longitudeText.trim());

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return {
      ok: false,
      title: 'Invalid latitude',
      message: 'Latitude must be a number between -90 and 90.',
    };
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return {
      ok: false,
      title: 'Invalid longitude',
      message: 'Longitude must be a number between -180 and 180.',
    };
  }
  return { ok: true, latitude, longitude };
}

export function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
