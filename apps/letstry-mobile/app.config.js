// app.config.js — Extends app.json with dynamic env-based overrides
// When building on EAS, GOOGLE_SERVICES_PLIST secret is injected automatically.
// When running locally, it falls back to the local file path.
const appJson = require('./app.json');
const withModularHeaders = require('./plugins/with-modular-headers');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_PLIST || './ios/GoogleService-Info.plist',
    },
    plugins: [
      ...(appJson.expo.plugins || []),
      // Step 1: use_frameworks! :linkage => :static — needed for Firebase Swift pods
      ['expo-build-properties', { ios: { useFrameworks: 'static' } }],
      // Step 2: post_install hook — fixes RNFBApp conflict with use_frameworks!
      withModularHeaders,
    ],
  },
};
