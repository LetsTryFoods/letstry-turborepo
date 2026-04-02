import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuestService } from '../services/guest.service';

const UPDATE_INTERVAL = 60 * 1000; // 1 minute

export const useGuestSession = () => {
  const appState = useRef(AppState.currentState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkAndInitSession = async () => {
    try {
      // We only run guest session logic if there is no user token
      const userToken = await AsyncStorage.getItem('access_token');
      if (!userToken) {
        await GuestService.ensureGuestSession();
      }
    } catch (error) {
      console.error('[useGuestSession] Error checking session:', error);
    }
  };

  useEffect(() => {
    // 1. Initial check on mount
    checkAndInitSession();

    // 2. Handle background/foreground transitions
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground!
        checkAndInitSession();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 3. Set up periodic updates while in foreground
    intervalRef.current = setInterval(() => {
      if (appState.current === 'active') {
        checkAndInitSession();
      }
    }, UPDATE_INTERVAL);

    return () => {
      subscription.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
