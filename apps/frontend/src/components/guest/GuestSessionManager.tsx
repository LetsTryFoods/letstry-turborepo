"use client";

import { useEffect } from 'react';
import { StorageService } from '@/lib/storage/storage-service';
import { GuestService } from '@/lib/guest/guest-service';

export const GuestSessionManager = () => {
  useEffect(() => {
    const initGuestSession = async () => {
      const isLoggedIn = StorageService.isLoggedIn();
      
      if (!isLoggedIn) {
        await GuestService.ensureGuestSession();
      }
    };

    initGuestSession();
  }, []);

  return null;
};
