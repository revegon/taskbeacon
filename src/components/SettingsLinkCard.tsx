import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';

type Props = {
  /** Shows a lock when the user isn't signed in. */
  locked: boolean;
};

/** Row on the Account page that opens the notification settings. */
export function SettingsLinkCard({ locked }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={locked ? 'Requires Google sign-in' : undefined}
      onPress={() => router.push('/notification-settings')}
      style={({ pressed }) => [styles.card, pressed && commonStyles.pressed]}
    >
      <View style={styles.iconBadge}>
        <Feather name="bell" size={18} color={colors.teal} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Notification settings</Text>
        <Text style={styles.hint}>Home, Office, distances and deadline reminders</Text>
      </View>
      <Feather name={locked ? 'lock' : 'chevron-right'} size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    padding: 18,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: colors.lightTeal,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
});
