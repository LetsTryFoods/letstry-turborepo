import { graphqlClient } from '@/lib/graphql/client-factory';
import { CREATE_GUEST_MUTATION, UPDATE_GUEST_MUTATION } from '@/lib/queries/guest';
import { StorageService } from '@/lib/storage/storage-service';

const ACTIVITY_THRESHOLD = 1 * 60 * 1000;

const getClientInfo = async () => {
  let ipAddress = null;
  let deviceInfo = null;

  if (typeof window !== 'undefined') {
    deviceInfo = window.navigator.userAgent;
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        const data = await ipResponse.json();
        ipAddress = data.ip;
      }
    } catch (e) {
    }
  }
  return { ipAddress, deviceInfo };
};

export const GuestService = {
  ensureGuestSession: async () => {
    try {
      const guestDbId = StorageService.getStorageItem('guestDbId');
      const lastUpdate = StorageService.getStorageItem('lastActiveUpdate');

      if (guestDbId) {
        if (lastUpdate && Date.now() - Number(lastUpdate) < ACTIVITY_THRESHOLD) {
          return;
        }
        try {
          await GuestService.updateGuestSession(guestDbId);
          StorageService.setStorageItem('lastActiveUpdate', Date.now().toString());
          return;
        } catch (error) {
          StorageService.removeStorageItem('guestId');
          StorageService.removeStorageItem('guestDbId');
          StorageService.removeStorageItem('sessionId');
          StorageService.removeStorageItem('lastActiveUpdate');
        }
      }

      await GuestService.createGuestSession();
    } catch (error) {
    }
  },

  updateGuestSession: async (id: string) => {
    const { ipAddress, deviceInfo } = await getClientInfo();

    await graphqlClient.request(UPDATE_GUEST_MUTATION.toString(), {
      id,
      input: {
        ipAddress,
        deviceInfo
      }
    });
  },

  createGuestSession: async () => {
    try {
      const { ipAddress, deviceInfo } = await getClientInfo();

      const response = await graphqlClient.request(CREATE_GUEST_MUTATION.toString(), {
        input: {
          ipAddress,
          deviceInfo
        }
      });

      const { _id, guestId, sessionId } = response.createGuest;

      if (_id && guestId && sessionId) {
        StorageService.setStorageItem('guestDbId', _id);
        StorageService.setStorageItem('guestId', guestId);
        StorageService.setStorageItem('sessionId', sessionId);
        StorageService.setStorageItem('lastActiveUpdate', Date.now().toString());
      }
    } catch (error) {
      throw error;
    }
  }
};
