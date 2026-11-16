# Google sign-in and Drive backup setup

The Account tab signs in with Google and backs up tasks and places to Google Drive.
It needs OAuth client IDs from a Google Cloud project. Until they are set, the Account
tab shows a "Google sign-in isn't set up" notice and the rest of the app works normally.

Google Sign-In uses native code, so it does **not** work in Expo Go. Use a development build.

## 1. Create the Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or pick a project.
2. Enable the **Google Drive API** for the project (APIs & Services → Library).
3. Configure the **OAuth consent screen** (Google Auth Platform):
   - User type: **External**.
   - Add this scope under data access: `https://www.googleapis.com/auth/drive.appdata`.
   - While the app is in **Testing**, add every Google account that will sign in as a **test user**.

The app only asks for `drive.appdata`. That gives it a hidden folder in the user's Drive
and no access to any of their other files.

## 2. Create OAuth client IDs

Create these under Credentials → Create credentials → OAuth client ID.

| Client type | Settings | Used for |
|---|---|---|
| Web application | No redirect URIs needed | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (required) |
| Android | Package `com.taskbeacon.app` and the SHA-1 of the signing key | Nothing to copy; Google matches it by package + SHA-1 |
| iOS (optional) | Bundle ID `com.taskbeacon.app` | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and `GOOGLE_IOS_URL_SCHEME` |

Create **one Android client per signing key**. Each build type is signed differently:

- **Local dev build** (`npx expo run:android`) uses the debug keystore generated in `android/app`:

  ```bash
  keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

- **EAS build**: run `npx eas-cli@latest credentials`, pick Android, and copy the SHA-1 it shows.
- **Google Play**: copy the app signing key SHA-1 from Play Console → App integrity.

## 3. Add the values to the app

Copy `.env.example` to `.env.local` (git-ignored) and fill it in:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1234-abcd.apps.googleusercontent.com
# iOS only:
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=1234-efgh.apps.googleusercontent.com
GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.1234-efgh
```

For EAS builds, set the same values as EAS environment variables, because `.env.local`
is not uploaded.

## 4. Rebuild

```bash
npx expo run:android
# or
npx eas-cli@latest build --profile development --platform android
```

## How the backup works

- **Back up now** writes `taskbeacon-backup.json` to the app's Drive folder, replacing the previous backup.
- **Restore from Drive** replaces the tasks and saved places on the phone, then restarts arrival reminders.
- The file holds a version number, the export time, all tasks and the saved places.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "not set up for this build" / `DEVELOPER_ERROR` | No Android OAuth client matches this build's package name and SHA-1 |
| Drive request fails with 403 "API not enabled" | Google Drive API isn't enabled in the project |
| Consent screen says access is blocked | The account isn't listed as a test user |
| Notice says sign-in isn't set up | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is missing; restart Metro after editing `.env.local` |
