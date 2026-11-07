import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  activeCount: number;
};

export function SummaryCard({ activeCount }: Props) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryCopy}>
        <Text style={styles.summaryEyebrow}>YOUR DAY</Text>
        <Text style={styles.summaryTitle}>
          {activeCount === 0
            ? 'A fresh start'
            : `${activeCount} ${activeCount === 1 ? 'thing' : 'things'} to do`}
        </Text>
        <Text style={styles.summaryHint}>
          {activeCount === 0
            ? 'Add a task and a place to get started.'
            : `${activeCount} place-based ${activeCount === 1 ? 'reminder' : 'reminders'} are ready.`}
        </Text>
      </View>
      <View style={styles.pinIllustration}>
        <View style={styles.pinOuter}>
          <View style={styles.pinInner} />
        </View>
        <View style={styles.pinShadow} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
