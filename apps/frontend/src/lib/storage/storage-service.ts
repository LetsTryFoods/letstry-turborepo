import { getCookie, setCookie, deleteCookie } from 'cookies-next';

export const StorageService = {
  setStorageItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
      setCookie(key, value, { maxAge: 60 * 60 * 24 * 30 }); 
    }
  },

  getStorageItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      const cookieVal = getCookie(key);
      if (cookieVal) return cookieVal as string;
      
      const localVal = localStorage.getItem(key);
      if (localVal) return localVal;

      return sessionStorage.getItem(key);
    }
    return null;
  },

  removeStorageItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      deleteCookie(key);
    }
  },

  isLoggedIn: (): boolean => {
    const token = getCookie('auth_token'); 
    return !!token;
  }
};
