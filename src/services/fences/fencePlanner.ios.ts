/**
 * iOS monitors at most 20 regions per app. Tasks within 50 m share a fence,
 * and when that still doesn't fit, the closest groups are merged into larger
 * fences, up to 500 m. Beyond that, only the fences nearest to the user are
 * registered and a replan circle swaps them as the user moves.
 */
import { FENCE_GROUP_DISTANCE_METERS } from '../../constants/config';
import { fenceFor, groupWithin, keepNearest, mergeToBudget } from './grouping';
import type { FencePlan, FencePlanInput } from './types';

export const MAX_GEOFENCES = 20;

/** Larger fences fire too early to be useful as an arrival reminder. */
const MAX_MERGED_RADIUS_METERS = 500;

export function planTaskFences({ points, taskRadius, budget, origin }: FencePlanInput): FencePlan {
  const groups = mergeToBudget(
    groupWithin(points, FENCE_GROUP_DISTANCE_METERS),
    budget,
    taskRadius,
    MAX_MERGED_RADIUS_METERS,
  );
  return keepNearest(
    groups.map((group) => fenceFor(group, taskRadius)),
    budget,
    origin,
  );
}
