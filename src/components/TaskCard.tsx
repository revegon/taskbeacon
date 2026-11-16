import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';
import { TASK_TYPES, type BeaconTask } from '../types/task';
import { formatDeadline, isOverdue } from '../utils/task';

type Props = {
  task: BeaconTask;
  onToggle: (task: BeaconTask) => void;
};

export function TaskCard({ task, onToggle }: Props) {
  const type = TASK_TYPES.find((item) => item.id === task.taskType) ?? TASK_TYPES[2];
  const overdue = isOverdue(task);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${task.completed ? 'Mark incomplete' : 'Complete'}: ${task.title}`}
      onPress={() => onToggle(task)}
      style={({ pressed }) => [
        styles.taskCard,
        pressed && commonStyles.pressed,
        task.completed && styles.completedCard,
      ]}
    >
      <View style={[styles.checkCircle, task.completed && styles.checkedCircle]}>
        {task.completed ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <View style={styles.taskCopy}>
        <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
          {task.title}
        </Text>
        {task.taskDescription ? (
          <Text numberOfLines={2} style={styles.taskDescription}>
            {task.taskDescription}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={11} color={colors.muted} />
          <Text style={styles.metaText}>{task.destination}</Text>
        </View>
        {task.deadline ? (
          <View style={styles.metaRow}>
            <Feather name="clock" size={11} color={overdue ? colors.danger : colors.muted} />
            <Text style={[styles.metaText, overdue && styles.overdueText]}>
              {overdue ? 'Overdue · ' : 'Due '}
              {formatDeadline(task.deadline)}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.typePill}>
        <Feather name={type.icon} size={10} color={colors.teal} />
        <Text style={styles.typeText}>{type.label.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 75,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  completedCard: {
    opacity: 0.65,
  },
  checkCircle: {
    alignItems: 'center',
    borderColor: '#C9D3D0',
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    marginRight: 12,
    width: 22,
  },
  checkedCircle: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  taskCopy: {
    flex: 1,
  },
  taskTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    opacity: 0.8,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
  },
  metaText: {
    color: colors.muted,
    fontSize: 11,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: '600',
  },
  typePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F6F2',
    borderRadius: 9,
    flexDirection: 'row',
    gap: 5,
    marginLeft: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  typeText: {
    color: colors.teal,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
