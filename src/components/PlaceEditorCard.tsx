import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCurrentCoordinates } from '../services/currentLocation';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';
import type { Coordinates } from '../types/place';
import { formatCoordinates, parseCoordinates } from '../utils/coordinates';
import { CoordinateFields } from './CoordinateFields';

type Props = {
  label: string;
  icon: 'home' | 'briefcase';
  saved?: Coordinates;
  onSave: (coordinates: Coordinates) => Promise<boolean>;
  onClear: () => Promise<boolean>;
};

export function PlaceEditorCard({ label, icon, saved, onSave, onClear }: Props) {
  // Starts from the stored values. The parent remounts this card (via key)
  // whenever the saved coordinates change, so no syncing effect is needed.
  const [latitudeText, setLatitudeText] = useState(saved ? String(saved.latitude) : '');
  const [longitudeText, setLongitudeText] = useState(saved ? String(saved.longitude) : '');
  const [isLocating, setIsLocating] = useState(false);

  async function fillCurrentLocation() {
    setIsLocating(true);
    try {
      const coordinates = await getCurrentCoordinates();
      if (coordinates) {
        setLatitudeText(coordinates.latitude.toFixed(6));
        setLongitudeText(coordinates.longitude.toFixed(6));
      }
    } catch (error) {
      console.error('TaskBeacon could not read the current location.', error);
      Alert.alert('Could not get your location', 'Make sure location services are on and try again.');
    } finally {
      setIsLocating(false);
    }
  }

  async function save() {
    if (!latitudeText.trim() || !longitudeText.trim()) {
      Alert.alert('Add coordinates', `Enter both latitude and longitude for ${label}.`);
      return;
    }
    const result = parseCoordinates(latitudeText, longitudeText);
    if (!result.ok) {
      Alert.alert(result.title, result.message);
      return;
    }
    if (await onSave({ latitude: result.latitude, longitude: result.longitude })) {
      Alert.alert(`${label} saved`, 'You can now pick it when adding a task.');
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBadge}>
          <Feather name={icon} size={18} color={colors.teal} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.cardTitle}>{label}</Text>
          <Text style={styles.cardStatus}>
            {saved ? formatCoordinates(saved.latitude, saved.longitude) : 'Not set yet'}
          </Text>
        </View>
      </View>

      <CoordinateFields
        latitudeText={latitudeText}
        longitudeText={longitudeText}
        onLatitudeChange={setLatitudeText}
        onLongitudeChange={setLongitudeText}
        onSubmitEditing={() => void save()}
      />

      <Pressable
        accessibilityRole="button"
        disabled={isLocating}
        onPress={() => void fillCurrentLocation()}
        style={({ pressed }) => [styles.locateButton, pressed && commonStyles.pressed]}
      >
        {isLocating ? (
          <ActivityIndicator color={colors.teal} />
        ) : (
          <>
            <Feather name="crosshair" size={14} color={colors.teal} />
            <Text style={styles.locateButtonText}>Use current location</Text>
          </>
        )}
      </Pressable>

      <View style={styles.actions}>
        {saved ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void onClear()}
            style={({ pressed }) => [styles.clearButton, pressed && commonStyles.pressed]}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => void save()}
          style={({ pressed }) => [styles.saveButton, pressed && commonStyles.pressed]}
        >
          <Text style={styles.saveButtonText}>Save {label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: colors.lightTeal,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  headerCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  cardStatus: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  locateButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    minHeight: 32,
  },
  locateButtonText: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  clearButton: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  clearButtonText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
