import { StyleSheet } from 'react-native';

import { colors } from './colors';

export const formStyles = StyleSheet.create({
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
});
