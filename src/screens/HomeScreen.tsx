import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTaskModal } from '../components/AddTaskModal';
import { EmptyState } from '../components/EmptyState';
import { HomeHeader } from '../components/HomeHeader';
import { SectionHeader } from '../components/SectionHeader';
import { SummaryCard } from '../components/SummaryCard';
import { TaskList } from '../components/TaskList';
import { usePlaces } from '../hooks/usePlaces';
import { useTasks } from '../hooks/useTasks';
import { colors } from '../theme/colors';
import type { NewTaskInput } from '../types/task';

export function HomeScreen() {
  const { activeTasks, completedTasks, isLoading, isSaving, addTask, toggleTask } = useTasks();
  const { places } = usePlaces();
  const [isAddVisible, setIsAddVisible] = useState(false);

  const openAddTask = () => setIsAddVisible(true);
  const closeAddTask = () => setIsAddVisible(false);

  function goToPlaces() {
    closeAddTask();
    router.navigate('/places');
  }

  async function handleAddTask(input: NewTaskInput) {
    const saved = await addTask(input);
    if (saved) closeAddTask();
    return saved;
  }

  const hasTasks = activeTasks.length > 0 || completedTasks.length > 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <SummaryCard activeCount={activeTasks.length} />
        <SectionHeader onAddPress={openAddTask} />

        {isLoading ? (
          <ActivityIndicator color={colors.teal} style={styles.loader} />
        ) : hasTasks ? (
          <TaskList
            tasks={[...activeTasks, ...completedTasks]}
            onToggle={(task) => void toggleTask(task)}
          />
        ) : (
          <EmptyState onCreatePress={openAddTask} />
        )}

        {!isLoading && completedTasks.length > 0 ? (
          <Text style={styles.footerNote}>{completedTasks.length} completed</Text>
        ) : null}
        <Text style={styles.footnote}>
          Arrival reminders need location and notification permissions.
        </Text>
      </ScrollView>

      <AddTaskModal
        visible={isAddVisible}
        isSaving={isSaving}
        places={places}
        onClose={closeAddTask}
        onManagePlaces={goToPlaces}
        onSubmit={handleAddTask}
      />
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
    paddingTop: 16,
    paddingBottom: 36,
  },
  loader: {
    marginVertical: 35,
  },
  footerNote: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 12,
    textAlign: 'right',
  },
  footnote: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 19,
    textAlign: 'center',
  },
});
