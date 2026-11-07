import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';

type Props = {
  onAddPress: () => void;
};

export function SectionHeader({ onAddPress }: Props) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>Your tasks</Text>
        <Text style={styles.sectionSubtitle}>The right thing, the right place</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onAddPress}
        style={({ pressed }) => [styles.addButton, pressed && commonStyles.pressed]}
      >
        <Text style={styles.addButtonText}>+ Add task</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
