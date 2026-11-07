import { Alert, Linking } from 'react-native';

export function promptForSettings(title: string, message: string) {
  Alert.alert(title, message, [
    { text: 'Not now', style: 'cancel' },
    {
      text: 'Open settings',
      onPress: () => {
        void Linking.openSettings().catch((error: unknown) => {
          console.error('TaskBeacon could not open system settings.', error);
          Alert.alert('Could not open settings', 'Please open your device settings manually.');
        });
      },
    },
  ]);
}
