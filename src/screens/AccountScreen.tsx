import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DriveBackupCard } from '../components/DriveBackupCard';
import { useGoogleAccount } from '../hooks/useGoogleAccount';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/common';

export function AccountScreen() {
  const { user, isRestoring, isSigningIn, isConfigured, signIn, signOut } = useGoogleAccount();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.heading}>Your account</Text>
        <Text style={styles.subheading}>
          Sign in with Google to keep your tasks and places safe in Google Drive.
        </Text>

        {!isConfigured ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Google sign-in isn&apos;t set up</Text>
            <Text style={styles.noticeText}>
              Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env.local and rebuild the app. See
              docs/google-drive-setup.md.
            </Text>
          </View>
        ) : isRestoring ? (
          <ActivityIndicator color={colors.teal} style={styles.loader} />
        ) : user ? (
          <View style={styles.cards}>
            <View style={styles.profileCard}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {(user.name ?? user.email).charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{user.name ?? 'Google account'}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
              </View>
            </View>

            <DriveBackupCard />

            <Pressable
              accessibilityRole="button"
              onPress={() => void signOut()}
              style={({ pressed }) => [styles.signOutButton, pressed && commonStyles.pressed]}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.signInCard}>
            <Text style={styles.signInTitle}>Back up with Google Drive</Text>
            <Text style={styles.signInText}>
              Your data is stored in a private app folder in your Drive, so you can restore it on
              a new phone.
            </Text>
            {isSigningIn ? (
              <ActivityIndicator color={colors.teal} style={styles.signInLoader} />
            ) : (
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => void signIn()}
                style={styles.googleButton}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
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
  noticeCard: {
    backgroundColor: '#FFF6E5',
    borderColor: '#F1DDB5',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 24,
    padding: 18,
  },
  noticeTitle: {
    color: '#7A5A14',
    fontSize: 14,
    fontWeight: '700',
  },
  noticeText: {
    color: '#7A5A14',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  avatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#A8D9C6',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    color: '#BDCACB',
    fontSize: 12,
    marginTop: 3,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  signOutText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  signInCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 24,
    padding: 22,
  },
  signInTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  signInText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: 'center',
  },
  signInLoader: {
    marginTop: 18,
    minHeight: 48,
  },
  googleButton: {
    marginTop: 18,
  },
});
