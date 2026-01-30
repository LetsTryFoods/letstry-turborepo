"use client";

import { useEffect } from 'react';
import { GuestService } from '@/lib/guest/guest-service';
import { graphqlClient } from '@/lib/graphql/client-factory';
import { ME_QUERY } from '@/lib/queries/auth';

export const GuestSessionManager = () => {
  useEffect(() => {
    const initGuestSession = async () => {
      try {
        const data = await graphqlClient.request(ME_QUERY) as { me: any };

        if (data.me) {
          return;
        }
      } catch (error) {
      }

      await GuestService.ensureGuestSession();
    };

    initGuestSession();
  }, []);

  return null;
};
