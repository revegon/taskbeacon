import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { AndroidImportance } from 'expo-notifications';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const STORAGE_KEY = 'taskbeacon.tasks';
const GEOFENCE_TASK = 'taskbeacon.geofence';
const GEOFENCE_RADIUS_METERS = 150;

type BeaconTask = {
  id: string;
  title: string;
  destination: string;
  latitude: number;
  longitude: number;
  completed: boolean;
  lastNotifiedAt?: number;
};

type GeofenceTaskData = {
  eventType: Location.GeofencingEventType;
  region: { identifier?: string };
};

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.error('TaskBeacon could not process a location reminder.', error);
    return;
  }

  const event = data as GeofenceTaskData | undefined;
  if (
    !event ||
    event.eventType !== Location.GeofencingEventType.Enter ||
    !event.region.identifier
  ) {
    return;
  }

  try {
    const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
    const tasks = storedTasks ? (JSON.parse(storedTasks) as BeaconTask[]) : [];
    const task = tasks.find(
      (item) => item.id === event.region.identifier && !item.completed,
    );

    if (!task || (task.lastNotifiedAt && Date.now() - task.lastNotifiedAt < 30 * 60 * 1000)) {
      return;
    }

    const updatedTasks = tasks.map((item) =>
      item.id === task.id ? { ...item, lastNotifiedAt: Date.now() } : item,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `You're near ${task.destination}`,
        body: `A nearby reminder: ${task.title}`,
      },
      trigger: null,
    });
  } catch (taskError) {
    console.error('TaskBeacon could not save a location reminder.', taskError);
  }
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const colors = {
  ink: '#172A35',
  muted: '#75838A',
  canvas: '#F6F7F2',
  white: '#FFFFFF',
  teal: '#2C7A70',
  lightTeal: '#E4F1EC',
  line: '#E8ECE7',
};

function promptForSettings(title: string, message: string) {
  Alert.alert(title, message, [
    { text: 'Not now', style: 'cancel' },
    {
      text: 'Open settings',
      onPress: () => {
        void Linking.openSettings().catch((error: unknown) => {
          console.error('TaskBeacon could not open system settings.', error);
          Alert.alert('Could not open settings', 'Please open your device settings manually.');
        });
      },
    },
  ]);
}

async function syncGeofences(tasks: BeaconTask[]) {
  const regions = tasks
    .filter((task) => !task.completed)
    .map((task) => ({
      identifier: task.id,
      latitude: task.latitude,
      longitude: task.longitude,
      radius: GEOFENCE_RADIUS_METERS,
      notifyOnEnter: true,
      notifyOnExit: false,
    }));

  if (regions.length > 20) {
    throw new Error('You can set arrival reminders for up to 20 active tasks.');
  }

  if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
  }
  if (regions.length > 0) {
    await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
  }
}

function formatToday() {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export default function App() {
  const [tasks, setTasks] = useState<BeaconTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadTasks() {
      try {
        const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && storedTasks) {
          setTasks(JSON.parse(storedTasks) as BeaconTask[]);
        }
      } catch (error) {
        console.error('TaskBeacon could not load saved tasks.', error);
        Alert.alert('Could not load tasks', 'Please restart the app and try again.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadTasks();
    return () => {
      mounted = false;
    };
  }, []);

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  async function saveTasks(nextTasks: BeaconTask[]) {
    await syncGeofences(nextTasks);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
    setTasks(nextTasks);
  }

  async function addTask() {
    const cleanTitle = title.trim();
    const cleanDestination = destination.trim();
    if (!cleanTitle || !cleanDestination) {
      Alert.alert('Add a task and place', 'Both fields are needed for an arrival reminder.');
      return;
    }
    if (activeTasks.length >= 20) {
      Alert.alert(
        'Reminder limit reached',
        'You can set arrival reminders for up to 20 active tasks.',
      );
      return;
    }

    setIsSaving(true);
    try {
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission?.status !== 'granted') {
        promptForSettings(
          'Location permission needed',
          'Enable location access in system settings to set up arrival reminders.',
        );
        return;
      }

      const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
      if (backgroundPermission?.status !== 'granted') {
        promptForSettings(
          'Background location needed',
          'Enable background location in system settings so TaskBeacon can notify you when you arrive, even when the app is closed.',
        );
        return;
      }

      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Arrival reminders',
            importance: AndroidImportance.DEFAULT,
          });
        } catch (channelError) {
          // Some Android runtimes (e.g. Expo Go) throw a native NullPointerException here.
          // Reminders are scheduled without a channelId, so they still use the fallback
          // channel; creating this one is not required to save the reminder.
          console.warn('TaskBeacon could not create the Android notification channel.', channelError);
        }
      }

      const notificationPermission = await Notifications.requestPermissionsAsync();
      if (!notificationPermission?.granted) {
        promptForSettings(
          'Notifications are off',
          'Enable notifications in system settings to receive arrival reminders.',
        );
        return;
      }

      const locations = await Location.geocodeAsync(cleanDestination);
      if (locations?.length === 0) {
        Alert.alert('Place not found', 'Try a more specific address or place name.');
        return;
      }

      const nextTasks = [
        {
          id: `${Date.now()}`,
          title: cleanTitle,
          destination: cleanDestination,
          latitude: locations[0]?.latitude,
          longitude: locations[0]?.longitude,
          completed: false,
        },
        ...tasks,
      ];
      await saveTasks(nextTasks);
      setTitle('');
      setDestination('');
      setIsAddVisible(false);
    } catch (error) {
      console.error('TaskBeacon could not create the arrival reminder.', error);
      Alert.alert(
        'Could not set the reminder',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleTask(task: BeaconTask) {
    try {
      const nextTasks = tasks.map((item) =>
        item.id === task.id ? { ...item, completed: !item.completed } : item,
      );
      await saveTasks(nextTasks);
    } catch (error) {
      console.error('TaskBeacon could not update a task.', error);
      Alert.alert('Could not update task', 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <View style={styles.brandDot} />
            </View>
            <Text style={styles.brandName}>TaskBeacon</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>TB</Text>
          </View>
        </View>

        <Text style={styles.dateLabel}>{formatToday().toUpperCase()}</Text>
        <Text style={styles.heading}>A little nudge,{"\n"}right on time.</Text>
        <Text style={styles.subheading}>
          Your to-dos, waiting in the right places.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryEyebrow}>YOUR DAY</Text>
            <Text style={styles.summaryTitle}>
              {activeTasks.length === 0
                ? 'A fresh start'
                : `${activeTasks.length} ${activeTasks.length === 1 ? 'thing' : 'things'} to do`}
            </Text>
            <Text style={styles.summaryHint}>
              {activeTasks.length === 0
                ? 'Add a task and a place to get started.'
                : `${activeTasks.length} place-based ${activeTasks.length === 1 ? 'reminder' : 'reminders'} are ready.`}
            </Text>
          </View>
          <View style={styles.pinIllustration}>
            <View style={styles.pinOuter}>
              <View style={styles.pinInner} />
            </View>
            <View style={styles.pinShadow} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your tasks</Text>
            <Text style={styles.sectionSubtitle}>The right thing, the right place</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsAddVisible(true)}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonText}>+ Add task</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.teal} style={styles.loader} />
        ) : activeTasks.length === 0 && completedTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>+</Text>
            </View>
            <Text style={styles.emptyTitle}>Make your first beacon</Text>
            <Text style={styles.emptyText}>
              Add a task and its destination. We&apos;ll remind you when you get nearby.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsAddVisible(true)}
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            >
              <Text style={styles.emptyButtonText}>Create a task</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.taskList}>
            {[...activeTasks, ...completedTasks].map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.completed ? 'Mark incomplete' : 'Complete'}: ${item.title}`}
                onPress={() => void toggleTask(item)}
                style={({ pressed }) => [
                  styles.taskCard,
                  pressed && styles.pressed,
                  item.completed && styles.completedCard,
                ]}
              >
                <View style={[styles.checkCircle, item.completed && styles.checkedCircle]}>
                  {item.completed ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <View style={styles.taskCopy}>
                  <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.taskDestination}>{item.destination}</Text>
                </View>
                <View style={styles.distancePill}>
                  <View style={styles.distanceDot} />
                  <Text style={styles.distanceText}>ALERT ON</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {!isLoading && completedTasks.length > 0 ? (
          <Text style={styles.footerNote}>{completedTasks.length} completed</Text>
        ) : null}
        <Text style={styles.footnote}>
          Arrival reminders need location and notification permissions.
        </Text>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setIsAddVisible(false)}
        transparent
        visible={isAddVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable style={styles.modalDismiss} onPress={() => setIsAddVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalEyebrow}>NEW BEACON</Text>
            <Text style={styles.modalTitle}>What needs doing?</Text>
            <Text style={styles.modalHint}>
              We&apos;ll remind you when you arrive at the place.
            </Text>
            <Text style={styles.inputLabel}>TASK</Text>
            <TextInput
              autoCapitalize="sentences"
              maxLength={100}
              onChangeText={setTitle}
              placeholder="Pick up a prescription"
              placeholderTextColor="#A1AAA9"
              returnKeyType="next"
              style={styles.input}
              value={title}
            />
            <Text style={styles.inputLabel}>PLACE OR ADDRESS</Text>
            <TextInput
              autoCapitalize="words"
              maxLength={150}
              onChangeText={setDestination}
              onSubmitEditing={() => void addTask()}
              placeholder="Pharmacy name or street address"
              placeholderTextColor="#A1AAA9"
              returnKeyType="done"
              style={styles.input}
              value={destination}
            />
            <View style={styles.permissionNote}>
              <Text style={styles.permissionNoteText}>
                Background location and notifications are needed for arrival alerts.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={() => void addTask()}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
                isSaving && styles.disabledButton,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Set arrival reminder</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 38,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  brandDot: {
    backgroundColor: '#B5E4D0',
    borderColor: colors.white,
    borderRadius: 7,
    borderWidth: 3,
    height: 15,
    width: 15,
  },
  brandName: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#E9EDE7',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarText: {
    color: colors.teal,
    fontSize: 11,
    fontWeight: '700',
  },
  dateLabel: {
    color: colors.teal,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heading: {
    color: colors.ink,
    fontSize: 35,
    fontWeight: '700',
    letterSpacing: -1.6,
    lineHeight: 40,
  },
  subheading: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
    minHeight: 146,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 19,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryEyebrow: {
    color: '#A8D9C6',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 11,
  },
  summaryTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  summaryHint: {
    color: '#BDCACB',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
    maxWidth: 200,
  },
  pinIllustration: {
    alignItems: 'center',
    height: 82,
    justifyContent: 'center',
    marginLeft: 8,
    width: 76,
  },
  pinOuter: {
    alignItems: 'center',
    backgroundColor: '#A8D9C6',
    borderColor: '#D8F1E5',
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    width: 48,
  },
  pinInner: {
    backgroundColor: colors.teal,
    borderColor: colors.ink,
    borderRadius: 11,
    borderWidth: 3,
    height: 21,
    width: 21,
  },
  pinShadow: {
    backgroundColor: '#52626A',
    borderRadius: 20,
    height: 6,
    marginTop: 12,
    opacity: 0.65,
    width: 38,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 31,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.lightTeal,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  addButtonText: {
    color: colors.teal,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 26,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.lightTeal,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  emptyIconText: {
    color: colors.teal,
    fontSize: 25,
    fontWeight: '400',
    marginTop: -2,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 240,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.teal,
    borderRadius: 12,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  taskList: {
    gap: 10,
  },
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
  modalBackdrop: {
    backgroundColor: 'rgba(23, 42, 53, 0.36)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#D7DEDA',
    borderRadius: 2,
    height: 4,
    marginBottom: 22,
    width: 36,
  },
  modalEyebrow: {
    color: colors.teal,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.7,
    marginTop: 8,
  },
  modalHint: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 22,
    marginTop: 6,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  permissionNote: {
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
    marginTop: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  permissionNoteText: {
    color: colors.teal,
    fontSize: 10,
    lineHeight: 15,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 13,
    justifyContent: 'center',
    marginTop: 17,
    minHeight: 49,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.78,
  },
});
