import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';
import { TASK_TYPES, type TaskType } from '../types/task';

type Props = {
  value: TaskType | null;
  onChange: (type: TaskType) => void;
};

/** Single-choice chips for the task type. */
export function TaskTypePicker({ value, onChange }: Props) {
  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {TASK_TYPES.map((type) => {
        const isSelected = type.id === value;
        return (
          <Pressable
            key={type.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            onPress={() => onChange(type.id)}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && commonStyles.pressed,
            ]}
          >
            <Feather name={type.icon} size={13} color={isSelected ? colors.white : colors.teal} />
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {type.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
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
});
