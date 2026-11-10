import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  type User,
} from '@react-native-google-signin/google-signin';

import { DRIVE_APPDATA_SCOPE, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../constants/google';

export type GoogleUser = User['user'];

export function isGoogleConfigured() {
  return GOOGLE_WEB_CLIENT_ID.length > 0;
}

/** Call once at startup, before any other Google Sign-In call. */
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: [DRIVE_APPDATA_SCOPE],
  });
}

/** Restores a previous session without showing UI. Resolves to null if there is none. */
export async function restoreGoogleSession(): Promise<GoogleUser | null> {
  if (!GoogleSignin.hasPreviousSignIn()) return null;
  const response = await GoogleSignin.signInSilently();
  return response.type === 'success' ? response.data.user : null;
}

/** Shows the Google sign-in sheet. Resolves to null if the user cancels. */
export async function signInWithGoogle(): Promise<GoogleUser | null> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;
    await ensureDriveScope(response.data.scopes);
    return response.data.user;
  } catch (error) {
    throw new Error(describeSignInError(error));
  }
}

export async function signOutOfGoogle() {
  await GoogleSignin.signOut();
}

/** A fresh OAuth access token for Google APIs. */
export async function getGoogleAccessToken(): Promise<string> {
  await ensureDriveScope(GoogleSignin.getCurrentUser()?.scopes ?? []);
  const { accessToken } = await GoogleSignin.getTokens();
  return accessToken;
}

/** Drops a token Google rejected (Android only), so the next getTokens() returns a new one. */
export async function discardAccessToken(token: string) {
  await GoogleSignin.clearCachedAccessToken(token);
}

// Users can untick Drive on the consent screen; ask again if it's missing.
async function ensureDriveScope(grantedScopes: string[]) {
  if (grantedScopes.includes(DRIVE_APPDATA_SCOPE)) return;
  const response = await GoogleSignin.addScopes({ scopes: [DRIVE_APPDATA_SCOPE] });
  if (!response || !isSuccessResponse(response) || !response.data.scopes.includes(DRIVE_APPDATA_SCOPE)) {
    throw new Error('TaskBeacon needs Google Drive access to back up your data.');
  }
}

function describeSignInError(error: unknown) {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.IN_PROGRESS:
        return 'Sign-in is already in progress.';
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'Google Play Services is missing or out of date on this device.';
    }
    // DEVELOPER_ERROR (code 10) almost always means the Android OAuth client's
    // package name or SHA-1 doesn't match this build.
    if (String(error.code) === '10' || error.message.includes('DEVELOPER_ERROR')) {
      return 'Google sign-in is not set up for this build. Check the Android OAuth client package name and SHA-1.';
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'Google sign-in failed.';
}
