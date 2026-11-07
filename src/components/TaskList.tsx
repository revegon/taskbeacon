import { StyleSheet, View } from 'react-native';

import type { BeaconTask } from '../types/task';
import { TaskCard } from './TaskCard';

type Props = {
  tasks: BeaconTask[];
  onToggle: (task: BeaconTask) => void;
};

export function TaskList({ tasks, onToggle }: Props) {
  return (
    <View style={styles.taskList}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggle={onToggle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  taskList: {
    gap: 10,
  },
});
