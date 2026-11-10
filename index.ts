// Defines the geofence task in global scope. It must load before the app renders
// so the OS can run it when it wakes the app in the background.
import './src/background/geofenceTask';
import { configureGoogleSignIn } from './src/services/googleAuth';
import { configureNotificationHandler } from './src/services/notifications';

configureNotificationHandler();
configureGoogleSignIn();

// Expo Router must be imported last. Routes live in src/app/.
import 'expo-router/entry';
