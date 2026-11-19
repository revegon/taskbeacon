/**
 * Metro picks fencePlanner.android.ts or fencePlanner.ios.ts at build time.
 * This file is only used by TypeScript and by platforms without geofencing (web).
 */
export { MAX_GEOFENCES, planTaskFences } from './fencePlanner.android';
