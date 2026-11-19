import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationSettingsForm } from '../components/NotificationSettingsForm';
import { useGoogleAccount } from '../hooks/useGoogleAccount';
import { useNotificationSettings, type DriveSyncStatus } from '../hooks/useNotificationSettings';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';

const SYNC_LABELS: Record<DriveSyncStatus, string> = {
  syncing: 'Syncing with Google Drive…',
  synced: 'Synced with Google Drive',
  offline: 'Saved on this phone. Drive will sync later.',
};

/** Editing is locked behind Google sign-in; the saved settings apply either way. */
function LockedNotice() {
  return (
    <View style={styles.lockedCard}>
      <View style={styles.lockBadge}>
        <Feather name="lock" size={18} color={colors.teal} />
      </View>
      <Text style={styles.lockedTitle}>Sign in to customize</Text>
      <Text style={styles.lockedText}>
        Notification settings are saved to your Google Drive, so they follow you to a new phone.
        Until then, the default reminders apply.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate('/account')}
        style={({ pressed }) => [styles.lockedButton, pressed && commonStyles.pressed]}
      >
        <Text style={styles.lockedButtonText}>Go to Account</Text>
      </Pressable>
    </View>
  );
}

export function NotificationSettingsScreen() {
  const { user, isRestoring } = useGoogleAccount();
  const { settings, syncStatus, isSaving, save } = useNotificationSettings(user !== null);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Text style={styles.subheading}>
          Choose when TaskBeacon reminds you near your places and before deadlines.
        </Text>

        {isRestoring || (user && !settings) ? (
          <ActivityIndicator color={colors.teal} style={styles.loader} />
        ) : !user || !settings ? (
          <LockedNotice />
        ) : (
          <>
            <View style={styles.syncRow}>
              <Feather
                name={syncStatus === 'offline' ? 'cloud-off' : 'cloud'}
                size={13}
                color={colors.muted}
              />
              <Text style={styles.syncText}>{SYNC_LABELS[syncStatus]}</Text>
            </View>
            <NotificationSettingsForm
              key={settings.updatedAt ?? 'defaults'}
              initial={settings}
              isSaving={isSaving}
              onSave={save}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  page: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 36,
  },
  subheading: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  loader: {
    marginVertical: 35,
  },
  syncRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  syncText: {
    color: colors.muted,
    fontSize: 11,
  },
  lockedCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: colors.lightTeal,
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  lockedTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  lockedText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: 'center',
  },
  lockedButton: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 46,
    paddingHorizontal: 22,
  },
  lockedButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
