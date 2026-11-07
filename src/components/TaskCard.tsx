import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';
import type { BeaconTask } from '../types/task';

type Props = {
  task: BeaconTask;
  onToggle: (task: BeaconTask) => void;
};

export function TaskCard({ task, onToggle }: Props) {
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
        <Text style={styles.taskDestination}>{task.destination}</Text>
      </View>
      <View style={styles.distancePill}>
        <View style={styles.distanceDot} />
        <Text style={styles.distanceText}>ALERT ON</Text>
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
  taskDestination: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 5,
  },
  distancePill: {
    alignItems: 'center',
    backgroundColor: '#F0F6F2',
    borderRadius: 9,
    flexDirection: 'row',
    gap: 5,
    marginLeft: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  distanceDot: {
    backgroundColor: colors.teal,
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  distanceText: {
    color: colors.teal,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
