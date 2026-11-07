import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';

type Props = {
  onCreatePress: () => void;
};

export function EmptyState({ onCreatePress }: Props) {
  return (
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
        onPress={onCreatePress}
        style={({ pressed }) => [styles.emptyButton, pressed && commonStyles.pressed]}
      >
        <Text style={styles.emptyButtonText}>Create a task</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
