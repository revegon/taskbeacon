export type BeaconTask = {
  id: string;
  title: string;
  /** Human-readable place label, shown in the list and in the arrival notification. */
  destination: string;
  latitude: number;
  longitude: number;
  completed: boolean;
  lastNotifiedAt?: number;
};

export type NewTaskInput = {
  title: string;
  latitude: number;
  longitude: number;
};
