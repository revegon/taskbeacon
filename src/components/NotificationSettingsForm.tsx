import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';
import type { PlaceId } from '../types/place';
import {
  DEADLINE_OFFSET_OPTIONS,
  PLACE_REMINDER_COPY,
  RADIUS_OPTIONS,
  type NotificationSettings,
} from '../types/settings';
import { formatOffset } from '../utils/task';

type Props = {
  /** The parent remounts the form (via `key`) when these change from outside. */
  initial: NotificationSettings;
  isSaving: boolean;
  onSave: (settings: NotificationSettings) => Promise<boolean>;
};

type ChipProps = { label: string; selected: boolean; onPress: () => void };

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && commonStyles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function RadiusChips({ value, onChange }: { value: number; onChange: (radius: number) => void }) {
  return (
    <View style={styles.chips}>
      {RADIUS_OPTIONS.map((radius) => (
        <Chip
          key={radius}
          label={`${radius} m`}
          selected={radius === value}
          onPress={() => onChange(radius)}
        />
      ))}
    </View>
  );
}

export function NotificationSettingsForm({ initial, isSaving, onSave }: Props) {
  const [draft, setDraft] = useState(initial);

  function updatePlace(place: PlaceId, change: Partial<NotificationSettings[PlaceId]>) {
    setDraft((current) => ({ ...current, [place]: { ...current[place], ...change } }));
  }

  function toggleOffset(offset: number) {
    setDraft((current) => {
      const selected = current.deadlineOffsetsMinutes.includes(offset);
      const offsets = selected
        ? current.deadlineOffsetsMinutes.filter((item) => item !== offset)
        : [...current.deadlineOffsetsMinutes, offset];
      return { ...current, deadlineOffsetsMinutes: offsets.sort((a, b) => b - a) };
    });
  }

  function submit() {
    if (draft.deadlineOffsetsMinutes.length === 0) {
      Alert.alert(
        'No deadline reminders',
        'Tasks with a deadline will not remind you before it is due. Save anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: () => void onSave(draft) },
        ],
      );
      return;
    }
    void onSave(draft);
  }

  return (
    <View style={styles.cards}>
      {(['home', 'office'] as const).map((place) => (
        <View key={place} style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.cardTitle}>{PLACE_REMINDER_COPY[place].title}</Text>
              <Text style={styles.cardHint}>{PLACE_REMINDER_COPY[place].hint}</Text>
            </View>
            <Switch
              accessibilityLabel={PLACE_REMINDER_COPY[place].title}
              onValueChange={(enabled) => updatePlace(place, { enabled })}
              thumbColor={colors.white}
              trackColor={{ false: colors.line, true: colors.teal }}
              value={draft[place].enabled}
            />
          </View>
          {draft[place].enabled ? (
            <>
              <Text style={styles.label}>DISTANCE</Text>
              <RadiusChips
                value={draft[place].radius}
                onChange={(radius) => updatePlace(place, { radius })}
              />
            </>
          ) : null}
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Arriving at a task&apos;s place</Text>
        <Text style={styles.cardHint}>
          How close counts as arrived. Smaller is more precise but can be missed.
        </Text>
        <Text style={styles.label}>DISTANCE</Text>
        <RadiusChips
          value={draft.taskRadius}
          onChange={(taskRadius) => setDraft((current) => ({ ...current, taskRadius }))}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Before a deadline</Text>
        <Text style={styles.cardHint}>
          Reminders are sent wherever you are. One due within 15 minutes after an arrival reminder
          is skipped.
        </Text>
        <Text style={styles.label}>REMIND ME</Text>
        <View style={styles.chips}>
          {DEADLINE_OFFSET_OPTIONS.map((offset) => (
            <Chip
              key={offset}
              label={`${formatOffset(offset)} before`}
              selected={draft.deadlineOffsetsMinutes.includes(offset)}
              onPress={() => toggleOffset(offset)}
            />
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isSaving}
        onPress={submit}
        style={({ pressed }) => [
          styles.saveButton,
          pressed && commonStyles.pressed,
          isSaving && styles.disabled,
        ]}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveButtonText}>Save settings</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  switchCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  cardHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  label: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: colors.teal,
  },
  chipText: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: colors.white,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 13,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 49,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },
});
