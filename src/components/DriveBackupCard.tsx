import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { backUpToDrive, getLastBackupTime, restoreFromDrive } from '../services/backup';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';

type Busy = 'backup' | 'restore' | null;

function formatBackupTime(isoTime: string | null) {
  if (!isoTime) return 'No backup yet';
  return `Last backup ${new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoTime))}`;
}

/** Back up and restore tasks and places with the user's Google Drive. */
export function DriveBackupCard() {
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);

  useEffect(() => {
    let mounted = true;
    getLastBackupTime()
      .then((time) => {
        if (mounted) setLastBackup(time);
      })
      .catch((error: unknown) => {
        console.warn('TaskBeacon could not check the Drive backup.', error);
      })
      .finally(() => {
        if (mounted) setIsChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function backUp() {
    setBusy('backup');
    try {
      setLastBackup(await backUpToDrive());
      Alert.alert('Backed up', 'Your tasks and places are saved to Google Drive.');
    } catch (error) {
      console.error('TaskBeacon could not back up to Drive.', error);
      Alert.alert('Backup failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function restore() {
    setBusy('restore');
    try {
      const result = await restoreFromDrive();
      Alert.alert(
        'Restored',
        result.remindersActive
          ? `${result.taskCount} tasks and your saved places are back on this phone.`
          : `${result.taskCount} tasks and your saved places are back. Allow location access to turn arrival reminders on.`,
      );
    } catch (error) {
      console.error('TaskBeacon could not restore from Drive.', error);
      Alert.alert('Restore failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  }

  function confirmRestore() {
    Alert.alert(
      'Restore from Google Drive?',
      'This replaces the tasks and places on this phone with your Drive backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive', onPress: () => void restore() },
      ],
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Feather name="cloud" size={18} color={colors.teal} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Google Drive backup</Text>
          <Text style={styles.status}>
            {isChecking ? 'Checking Drive…' : formatBackupTime(lastBackup)}
          </Text>
        </View>
      </View>
      <Text style={styles.hint}>
        Saved in a private app folder in your Drive. TaskBeacon can&apos;t see your other files.
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={busy !== null}
        onPress={() => void backUp()}
        style={({ pressed }) => [styles.primaryButton, pressed && commonStyles.pressed]}
      >
        {busy === 'backup' ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Back up now</Text>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={busy !== null || (!isChecking && !lastBackup)}
        onPress={confirmRestore}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && commonStyles.pressed,
          !isChecking && !lastBackup && styles.disabled,
        ]}
      >
        {busy === 'restore' ? (
          <ActivityIndicator color={colors.teal} />
        ) : (
          <Text style={styles.secondaryButtonText}>Restore from Drive</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: colors.lightTeal,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 46,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 46,
  },
  secondaryButtonText: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
