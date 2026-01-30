"use client";

import { useEffect } from 'react';
import { GuestService } from '@/lib/guest/guest-service';
import { graphqlClient } from '@/lib/graphql/client-factory';
import { ME_QUERY } from '@/lib/queries/auth';

export const GuestSessionManager = () => {
  useEffect(() => {
    const initGuestSession = async () => {
      console.log('[GuestSessionManager] Checking auth via ME_QUERY');

      try {
        const data = await graphqlClient.request(ME_QUERY) as { me: any };
        console.log('[GuestSessionManager] ME_QUERY result:', data.me ? 'User found' : 'No user');

        if (data.me) {
          console.log('[GuestSessionManager] User logged in, skipping guest session');
          return;
        }
      } catch (error: any) {
        console.log('[GuestSessionManager] ME_QUERY error:', error.message);
      }

      console.log('[GuestSessionManager] Creating guest session');
      await GuestService.ensureGuestSession();
    };

    initGuestSession();
  }, []);

  return null;
};
