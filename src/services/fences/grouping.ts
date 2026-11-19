/**
 * Platform-neutral helpers used by fencePlanner.android.ts and fencePlanner.ios.ts.
 * Fences are always derived from the open tasks, never stored.
 */
import { TASK_FENCE_PREFIX } from '../../constants/config';
import type { Coordinates } from '../../types/place';
import { centerOf, distanceMeters } from '../../utils/geo';
import type { FencePlan, FencePoint, TaskFence } from './types';

/** The smallest replan circle, so GPS drift alone doesn't trigger a new plan. */
const MIN_REPLAN_RADIUS_METERS = 300;
const MAX_REPLAN_RADIUS_METERS = 5000;

/**
 * Splits points into groups where every point is within `distance` of at
 * least one other point in its group.
 */
export function groupWithin(points: FencePoint[], distance: number): FencePoint[][] {
  const parent = points.map((_, index) => index);
  const root = (index: number): number => {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]];
      index = parent[index];
    }
    return index;
  };

  for (let a = 0; a < points.length; a++) {
    for (let b = a + 1; b < points.length; b++) {
      if (distanceMeters(points[a], points[b]) <= distance) parent[root(a)] = root(b);
    }
  }

  const groups = new Map<number, FencePoint[]>();
  points.forEach((point, index) => {
    const key = root(index);
    groups.set(key, [...(groups.get(key) ?? []), point]);
  });
  return [...groups.values()];
}

/** The smallest circle around the group's center that keeps `taskRadius` around every task. */
export function fenceFor(group: FencePoint[], taskRadius: number): TaskFence {
  const center = centerOf(group);
  const spread = Math.max(...group.map((point) => distanceMeters(center, point)));
  const taskIds = group.map((point) => point.taskId).sort();
  return {
    // Named after the oldest task, so the id survives when other tasks in the group change.
    identifier: `${TASK_FENCE_PREFIX}${taskIds[0]}`,
    latitude: center.latitude,
    longitude: center.longitude,
    radius: Math.ceil(taskRadius + spread),
    taskIds,
  };
}

/**
 * Repeatedly merges the pair of groups whose merged fence is smallest, until
 * the groups fit in `budget` or the next merge would exceed `maxRadius`.
 */
export function mergeToBudget(
  groups: FencePoint[][],
  budget: number,
  taskRadius: number,
  maxRadius: number,
): FencePoint[][] {
  const result = [...groups];
  while (result.length > budget) {
    let best: { a: number; b: number; radius: number } | null = null;
    for (let a = 0; a < result.length; a++) {
      for (let b = a + 1; b < result.length; b++) {
        const { radius } = fenceFor([...result[a], ...result[b]], taskRadius);
        if (!best || radius < best.radius) best = { a, b, radius };
      }
    }
    if (!best || best.radius > maxRadius) break;
    const merged = [...result[best.a], ...result[best.b]];
    result.splice(best.b, 1);
    result.splice(best.a, 1, merged);
  }
  return result;
}

/** Distance from the user to the edge of a fence (0 when inside it). */
function distanceToEdge(origin: Coordinates, fence: TaskFence) {
  return Math.max(0, distanceMeters(origin, fence) - fence.radius);
}

/**
 * Keeps every fence when they fit. Otherwise keeps the nearest ones, leaving
 * one slot for a replan circle around the user.
 */
export function keepNearest(
  fences: TaskFence[],
  budget: number,
  origin: Coordinates | null,
): FencePlan {
  if (fences.length <= budget) return { fences, replanBoundary: null };
  if (!origin || budget < 2) return { fences: fences.slice(0, budget), replanBoundary: null };

  const sorted = [...fences].sort((a, b) => distanceToEdge(origin, a) - distanceToEdge(origin, b));
  const kept = sorted.slice(0, budget - 1);
  const nearestLeftOut = sorted[budget - 1];
  // Re-plan once the user has covered half the gap to the nearest fence that was left out.
  const radius = Math.min(
    MAX_REPLAN_RADIUS_METERS,
    Math.max(MIN_REPLAN_RADIUS_METERS, distanceToEdge(origin, nearestLeftOut) / 2),
  );
  return { fences: kept, replanBoundary: { ...origin, radius } };
}
