import Feather from '@expo/vector-icons/Feather';
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
import { formStyles } from '../theme/form';
import { PLACE_DEFINITIONS, type PlaceId, type SavedPlaces } from '../types/place';
import type { NewTaskInput } from '../types/task';
import { parseCoordinates } from '../utils/coordinates';
import { CoordinateFields } from './CoordinateFields';

type Props = {
  visible: boolean;
  isSaving: boolean;
  places: SavedPlaces;
  onClose: () => void;
  /** Opens the Places tab so the user can set up Home/Office. */
  onManagePlaces: () => void;
  /** Resolves to true when the task was saved; the form is then cleared. */
  onSubmit: (input: NewTaskInput) => Promise<boolean>;
};

export function AddTaskModal({
  visible,
  isSaving,
  places,
  onClose,
  onManagePlaces,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState('');
  const [latitudeText, setLatitudeText] = useState('');
  const [longitudeText, setLongitudeText] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<PlaceId | null>(null);

  const savedPlaces = PLACE_DEFINITIONS.filter((place) => places[place.id]);
  const selectedPlace = PLACE_DEFINITIONS.find((place) => place.id === selectedPlaceId);

  function pickPlace(id: PlaceId) {
    const coordinates = places[id];
    if (!coordinates) return;
    setSelectedPlaceId(id);
    setLatitudeText(String(coordinates.latitude));
    setLongitudeText(String(coordinates.longitude));
  }

  // Typing coordinates by hand means the task is no longer tied to a saved place.
  function editLatitude(text: string) {
    setSelectedPlaceId(null);
    setLatitudeText(text);
  }

  function editLongitude(text: string) {
    setSelectedPlaceId(null);
    setLongitudeText(text);
  }

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
      placeLabel: selectedPlace?.label,
    });
    if (saved) {
      setTitle('');
      setLatitudeText('');
      setLongitudeText('');
      setSelectedPlaceId(null);
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

          <Text style={formStyles.inputLabel}>TASK</Text>
          <TextInput
            autoCapitalize="sentences"
            maxLength={100}
            onChangeText={setTitle}
            placeholder="Pick up a prescription"
            placeholderTextColor={colors.placeholder}
            returnKeyType="next"
            style={formStyles.input}
            value={title}
          />

          <Text style={formStyles.inputLabel}>PLACE</Text>
          {savedPlaces.length > 0 ? (
            <View style={styles.chips}>
              {savedPlaces.map((place) => {
                const isSelected = place.id === selectedPlaceId;
                return (
                  <Pressable
                    key={place.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => pickPlace(place.id)}
                    style={({ pressed }) => [
                      styles.chip,
                      isSelected && styles.chipSelected,
                      pressed && commonStyles.pressed,
                    ]}
                  >
                    <Feather
                      name={place.icon}
                      size={13}
                      color={isSelected ? colors.white : colors.teal}
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {place.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Pressable accessibilityRole="link" onPress={onManagePlaces}>
              <Text style={styles.manageLink}>
                Save your Home and Office to pick them here.
              </Text>
            </Pressable>
          )}

          <CoordinateFields
            latitudeText={latitudeText}
            longitudeText={longitudeText}
            onLatitudeChange={editLatitude}
            onLongitudeChange={editLongitude}
            onSubmitEditing={() => void submit()}
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
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    minHeight: 34,
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
  manageLink: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
