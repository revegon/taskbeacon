import Feather from '@expo/vector-icons/Feather';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';
import { formatDeadline } from '../utils/task';

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

/** One hour from now, rounded up to the next quarter hour. */
function defaultDeadline() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  return date;
}

/** Android shows the date dialog, then the time dialog. Cancelling either keeps the old value. */
function pickOnAndroid(current: Date | null, onChange: (date: Date) => void) {
  const start = current ?? defaultDeadline();
  DateTimePickerAndroid.open({
    mode: 'date',
    value: start,
    minimumDate: new Date(),
    onChange: (dateEvent, pickedDate) => {
      if (dateEvent.type !== 'set' || !pickedDate) return;
      DateTimePickerAndroid.open({
        mode: 'time',
        value: start,
        onChange: (timeEvent, pickedTime) => {
          if (timeEvent.type !== 'set' || !pickedTime) return;
          const combined = new Date(pickedDate);
          combined.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
          onChange(combined);
        },
      });
    },
  });
}

/** Optional deadline: a button that opens native pickers, with a clear action. */
export function DeadlineField({ value, onChange }: Props) {
  const isIos = Platform.OS === 'ios';

  function openPicker() {
    if (isIos) {
      // iOS edits inline with the compact picker below; just start from a default.
      if (!value) onChange(defaultDeadline());
      return;
    }
    pickOnAndroid(value, onChange);
  }

  return (
    <View style={styles.row}>
      {isIos && value ? (
        <DateTimePicker
          accentColor={colors.teal}
          display="compact"
          minimumDate={new Date()}
          mode="datetime"
          onChange={(_, date) => date && onChange(date)}
          value={value}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={value ? `Deadline ${formatDeadline(value)}. Change` : 'Add a deadline'}
          onPress={openPicker}
          style={({ pressed }) => [styles.field, pressed && commonStyles.pressed]}
        >
          <Feather name="calendar" size={15} color={value ? colors.ink : colors.placeholder} />
          <Text style={[styles.fieldText, !value && styles.placeholder]}>
            {value ? formatDeadline(value) : 'No deadline'}
          </Text>
        </Pressable>
      )}

      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove deadline"
          hitSlop={8}
          onPress={() => onChange(null)}
          style={({ pressed }) => [styles.clearButton, pressed && commonStyles.pressed]}
        >
          <Feather name="x" size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  fieldText: {
    color: colors.ink,
    fontSize: 13,
  },
  placeholder: {
    color: colors.placeholder,
  },
  clearButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
