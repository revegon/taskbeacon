/**
 * Android allows 100 geofences per app, so tasks only share a fence when
 * their locations are within 50 m of each other.
 */
import { FENCE_GROUP_DISTANCE_METERS } from '../../constants/config';
import { fenceFor, groupWithin, keepNearest } from './grouping';
import type { FencePlan, FencePlanInput } from './types';

export const MAX_GEOFENCES = 100;

export function planTaskFences({ points, taskRadius, budget, origin }: FencePlanInput): FencePlan {
  const fences = groupWithin(points, FENCE_GROUP_DISTANCE_METERS).map((group) =>
    fenceFor(group, taskRadius),
  );
  return keepNearest(fences, budget, origin);
}
