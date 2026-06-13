import { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Lazy-load Firebase Auth to avoid crashing if native module isn't linked yet
export function getFirebaseAuth(): FirebaseAuthTypes.Module | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const auth = require('@react-native-firebase/auth').default;
    return auth();
  } catch (e) {
    console.warn('[Firebase] Native module not available. Rebuild dev client to enable SMS fallback.', e);
    return null;
  }
}
