import type { Coordinates } from '../../types/place';

/** One open task with a location. */
export type FencePoint = Coordinates & { taskId: string };

/** A geofence covering one or more nearby tasks. */
export type TaskFence = Coordinates & {
  identifier: string;
  radius: number;
  taskIds: string[];
};

export type FencePlanInput = {
  points: FencePoint[];
  /** Radius around each single task, in meters. */
  taskRadius: number;
  /** How many task fences may be registered. */
  budget: number;
  /** The user's last known position, used to pick the nearest fences when over budget. */
  origin: Coordinates | null;
};

export type FencePlan = {
  fences: TaskFence[];
  /**
   * Set when some fences were left out. Leaving this circle around the user
   * should trigger a new plan, so the nearest fences are always registered.
   */
  replanBoundary: (Coordinates & { radius: number }) | null;
};
