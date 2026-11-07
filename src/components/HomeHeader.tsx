import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { formatToday } from '../utils/date';

export function HomeHeader() {
  return (
    <>
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
      <Text style={styles.heading}>A little nudge,{'\n'}right on time.</Text>
      <Text style={styles.subheading}>Your to-dos, waiting in the right places.</Text>
    </>
  );
}

const styles = StyleSheet.create({
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
});
