import { Platform, Text, TextInput } from 'react-native';

import { colors } from '../theme/colors';
import { formStyles } from '../theme/form';

// iOS's plain numeric pad has no minus sign, which negative coordinates need.
const coordinateKeyboard = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';

type Props = {
  latitudeText: string;
  longitudeText: string;
  onLatitudeChange: (text: string) => void;
  onLongitudeChange: (text: string) => void;
  onSubmitEditing?: () => void;
};

/** Latitude and longitude text inputs with labels. */
export function CoordinateFields({
  latitudeText,
  longitudeText,
  onLatitudeChange,
  onLongitudeChange,
  onSubmitEditing,
}: Props) {
  return (
    <>
      <Text style={formStyles.inputLabel}>LATITUDE</Text>
      <TextInput
        autoCorrect={false}
        keyboardType={coordinateKeyboard}
        maxLength={20}
        onChangeText={onLatitudeChange}
        placeholder="12.97160"
        placeholderTextColor={colors.placeholder}
        returnKeyType="next"
        style={formStyles.input}
        value={latitudeText}
      />
      <Text style={formStyles.inputLabel}>LONGITUDE</Text>
      <TextInput
        autoCorrect={false}
        keyboardType={coordinateKeyboard}
        maxLength={20}
        onChangeText={onLongitudeChange}
        onSubmitEditing={onSubmitEditing}
        placeholder="77.59460"
        placeholderTextColor={colors.placeholder}
        returnKeyType="done"
        style={formStyles.input}
        value={longitudeText}
      />
    </>
  );
}
