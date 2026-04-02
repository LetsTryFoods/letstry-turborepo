import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  _id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  sessionId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => Promise<void>;
  setSessionId: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  setInitialized: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      sessionId: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,

      setAuth: async (user, token) => {
        set({ user, accessToken: token, isAuthenticated: true });
      },

      setSessionId: async (id) => {
        set({ sessionId: id });
      },

      logout: async () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setInitialized: (val) => set({ isInitialized: val }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        sessionId: state.sessionId,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
