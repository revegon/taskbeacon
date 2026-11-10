// Extends app.json. Adds the Google Sign-In config plugin only when an iOS URL
// scheme is provided, because the plugin (without Firebase) needs it and it only
// affects iOS. Android sign-in works without the plugin.
// Values come from .env.local; see .env.example and docs/google-drive-setup.md.
module.exports = ({ config }) => {
  const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ...(iosUrlScheme ? [['@react-native-google-signin/google-signin', { iosUrlScheme }]] : []),
    ],
  };
};
