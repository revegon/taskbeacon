import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaceEditorCard } from '../components/PlaceEditorCard';
import { usePlaces } from '../hooks/usePlaces';
import { colors } from '../theme/colors';
import { PLACE_DEFINITIONS } from '../types/place';

export function PlacesScreen() {
  const { places, isLoading, savePlace, clearPlace } = usePlaces();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>SAVED PLACES</Text>
          <Text style={styles.heading}>Home & office</Text>
          <Text style={styles.subheading}>
            Save the places you go most. Pick them when adding a task instead of typing
            coordinates.
          </Text>

          {isLoading ? (
            <ActivityIndicator color={colors.teal} style={styles.loader} />
          ) : (
            <View style={styles.cards}>
              {PLACE_DEFINITIONS.map((place) => (
                <PlaceEditorCard
                  // Remount with fresh fields when this place is saved or cleared.
                  key={`${place.id}:${places[place.id]?.latitude}:${places[place.id]?.longitude}`}
                  label={place.label}
                  icon={place.icon}
                  saved={places[place.id]}
                  onSave={(coordinates) => savePlace(place.id, coordinates)}
                  onClear={() => clearPlace(place.id)}
                />
              ))}
            </View>
          )}

          <Text style={styles.footnote}>
            Tip: in Google Maps, long-press a spot to copy its latitude and longitude.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  flex: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  eyebrow: {
    color: colors.teal,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 22,
  },
  heading: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1.4,
  },
  subheading: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },
  loader: {
    marginVertical: 35,
  },
  cards: {
    gap: 14,
    marginTop: 24,
  },
  footnote: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 19,
    textAlign: 'center',
  },
});
