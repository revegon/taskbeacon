import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';
import type { NewTaskInput } from '../types/task';
import { parseCoordinates } from '../utils/coordinates';

// iOS's plain numeric pad has no minus sign, which negative coordinates need.
const coordinateKeyboard = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';

type Props = {
  visible: boolean;
  isSaving: boolean;
  onClose: () => void;
  /** Resolves to true when the task was saved; the form is then cleared. */
  onSubmit: (input: NewTaskInput) => Promise<boolean>;
};

export function AddTaskModal({ visible, isSaving, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [latitudeText, setLatitudeText] = useState('');
  const [longitudeText, setLongitudeText] = useState('');

  async function submit() {
    const cleanTitle = title.trim();
    if (!cleanTitle || !latitudeText.trim() || !longitudeText.trim()) {
      Alert.alert(
        'Add a task and coordinates',
        'The task, latitude and longitude are all needed for an arrival reminder.',
      );
      return;
    }

    const coordinates = parseCoordinates(latitudeText, longitudeText);
    if (!coordinates.ok) {
      Alert.alert(coordinates.title, coordinates.message);
      return;
    }

    const saved = await onSubmit({
      title: cleanTitle,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });
    if (saved) {
      setTitle('');
      setLatitudeText('');
      setLongitudeText('');
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <Pressable style={styles.modalDismiss} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.modalEyebrow}>NEW BEACON</Text>
          <Text style={styles.modalTitle}>What needs doing?</Text>
          <Text style={styles.modalHint}>We&apos;ll remind you when you arrive at the place.</Text>

          <Text style={styles.inputLabel}>TASK</Text>
          <TextInput
            autoCapitalize="sentences"
            maxLength={100}
            onChangeText={setTitle}
            placeholder="Pick up a prescription"
            placeholderTextColor={colors.placeholder}
            returnKeyType="next"
            style={styles.input}
            value={title}
          />
          <Text style={styles.inputLabel}>LATITUDE</Text>
          <TextInput
            autoCorrect={false}
            keyboardType={coordinateKeyboard}
            maxLength={20}
            onChangeText={setLatitudeText}
            placeholder="12.97160"
            placeholderTextColor={colors.placeholder}
            returnKeyType="next"
            style={styles.input}
            value={latitudeText}
          />
          <Text style={styles.inputLabel}>LONGITUDE</Text>
          <TextInput
            autoCorrect={false}
            keyboardType={coordinateKeyboard}
            maxLength={20}
            onChangeText={setLongitudeText}
            onSubmitEditing={() => void submit()}
            placeholder="77.59460"
            placeholderTextColor={colors.placeholder}
            returnKeyType="done"
            style={styles.input}
            value={longitudeText}
          />

          <View style={styles.permissionNote}>
            <Text style={styles.permissionNoteText}>
              Background location and notifications are needed for arrival alerts.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={() => void submit()}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && commonStyles.pressed,
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
  );
}

const styles = StyleSheet.create({
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
});
