import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  isGoogleConfigured,
  restoreGoogleSession,
  signInWithGoogle,
  signOutOfGoogle,
  type GoogleUser,
} from '../services/googleAuth';

/** Google account state for the Account screen. Restores the session on mount. */
export function useGoogleAccount() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(isGoogleConfigured());
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!isGoogleConfigured()) return;
    let mounted = true;
    restoreGoogleSession()
      .then((restored) => {
        if (mounted) setUser(restored);
      })
      .catch((error: unknown) => {
        console.warn('TaskBeacon could not restore the Google session.', error);
      })
      .finally(() => {
        if (mounted) setIsRestoring(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function signIn() {
    setIsSigningIn(true);
    try {
      const signedIn = await signInWithGoogle();
      if (signedIn) setUser(signedIn);
    } catch (error) {
      console.error('TaskBeacon could not sign in with Google.', error);
      Alert.alert('Could not sign in', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    try {
      await signOutOfGoogle();
      setUser(null);
    } catch (error) {
      console.error('TaskBeacon could not sign out.', error);
      Alert.alert('Could not sign out', 'Please try again.');
    }
  }

  return { user, isRestoring, isSigningIn, isConfigured: isGoogleConfigured(), signIn, signOut };
}
