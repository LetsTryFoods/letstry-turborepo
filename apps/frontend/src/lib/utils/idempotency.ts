import Cookies from 'js-cookie';

const COOKIE_NAME = 'paymentIdempotencyKey';
const COOKIE_MAX_AGE_MINUTES = 30;

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getOrCreateIdempotencyKey = (): string => {
  let key = Cookies.get(COOKIE_NAME);

  if (!key) {
    key = generateUUID();
    Cookies.set(COOKIE_NAME, key, {
      expires: COOKIE_MAX_AGE_MINUTES / (24 * 60),
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return key;
};

export const clearIdempotencyKey = (): void => {
  Cookies.remove(COOKIE_NAME, { path: '/' });
};

export const hasIdempotencyKey = (): boolean => {
  return !!Cookies.get(COOKIE_NAME);
};
