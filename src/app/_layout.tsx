import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { syncReminders } from '../services/reminders';
import { colors } from '../theme/colors';

export default function RootLayout() {
  // Re-registers fences and tops up scheduled deadline reminders on every app start.
  useEffect(() => {
    syncReminders().catch((error: unknown) => {
      console.warn('TaskBeacon could not refresh reminders on start.', error);
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.ink,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notification-settings" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
