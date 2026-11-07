import { registerRootComponent } from 'expo';

// Defines the geofence task in global scope. It must load before the app renders
// so the OS can run it when it wakes the app in the background.
import './src/background/geofenceTask';
import { configureNotificationHandler } from './src/services/notifications';

import App from './App';

configureNotificationHandler();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
