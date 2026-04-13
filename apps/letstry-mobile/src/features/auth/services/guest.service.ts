import { Platform } from 'react-native';
import { client as apolloClient } from '../../../lib/apollo-client';
import { CREATE_GUEST, UPDATE_GUEST_MUTATION } from '../../../lib/graphql/guest';
import { useAuthStore } from '../../../store/auth-store';
import AuthLogger from '../../../lib/utils/auth-logger';

const ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes

const getClientInfo = async () => {
  let ipAddress = 'mobile-app';
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (response.ok) {
      const data = await response.json();
      ipAddress = data.ip || 'mobile-app';
    }
  } catch (error) {
    AuthLogger.warn('Failed to fetch IP address:', error);
  }

  return {
    ipAddress,
    deviceInfo: `${Platform.OS} ${Platform.Version}`,
  };
};

export const GuestService = {
  ensureGuestSession: async () => {
    const { sessionId, setSessionId, setInitialized } = useAuthStore.getState();
    const guestDbId = useAuthStore.getState().user?._id; // We'll store DB ID here for guests too if needed

    try {
      if (sessionId) {
        // Simple check for stale session in memory / storage
        // In a real app we might verify this session with a small 'me' query
        setInitialized(true);
        return;
      }

      await GuestService.createGuestSession();
      setInitialized(true);
    } catch (error) {
      AuthLogger.error('Error in ensureGuestSession:', error);
      setInitialized(true); // Don't block the app even if guest creation fails
    }
  },

  createGuestSession: async () => {
    try {
      const { ipAddress, deviceInfo } = await getClientInfo();
      const { setSessionId } = useAuthStore.getState();

      const { data } = await apolloClient.mutate({
        mutation: CREATE_GUEST,
        variables: {
          input: {
            ipAddress,
            deviceInfo,
          },
        },
      });

      if (data?.createGuest) {
        const { sessionId } = data.createGuest;
        await setSessionId(sessionId);
        AuthLogger.info('Guest session created:', sessionId);
      }
    } catch (error) {
      AuthLogger.error('Error in createGuestSession:', error);
      throw error;
    }
  },
};
