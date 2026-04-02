import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'paymentIdempotencyKey';
const EXPIRY_KEY = 'paymentIdempotencyKeyExpiry';
const EXPIRY_MINUTES = 30;

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getOrCreateIdempotencyKey = async (): Promise<string> => {
  try {
    const [key, expiryStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(EXPIRY_KEY),
    ]);

    const isValid = key && expiryStr && Date.now() < parseInt(expiryStr, 10);

    if (isValid) {
      return key!;
    }

    const newKey = generateUUID();
    const expiry = Date.now() + EXPIRY_MINUTES * 60 * 1000;
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, newKey),
      AsyncStorage.setItem(EXPIRY_KEY, String(expiry)),
    ]);
    return newKey;
  } catch {
    // Fallback to a fresh key if storage fails
    return generateUUID();
  }
};

export const clearIdempotencyKey = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(EXPIRY_KEY),
    ]);
  } catch {
    // Silent fail
  }
};
