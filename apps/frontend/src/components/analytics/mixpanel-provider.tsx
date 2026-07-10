"use client";

import { useEffect, useRef } from "react";
import { initMixpanel, mpIdentify, mpReset } from "@/lib/analytics/mixpanel";
import { useAuthStore } from "@/stores/auth-store";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

/**
 * MixpanelProvider
 *
 * Invisible client component that:
 * 1. Initialises Mixpanel once on mount with the project token
 * 2. Calls mpIdentify() when a user logs in (links events to a known user)
 * 3. Calls mpReset() when a user logs out (starts a fresh anonymous session)
 *
 * Guest users are tracked with Mixpanel's auto-generated anonymous distinct ID
 * so funnel drop-off is captured even before login. When they log in later,
 * mpIdentify() merges the anonymous and identified profiles automatically.
 *
 * Mount once in the root layout inside <AuthProvider>.
 */
export function MixpanelProvider() {
  const { user, isAuthenticated } = useAuthStore();
  const prevUserRef = useRef<string | null>(null);

  // Step 1: Initialise on mount
  useEffect(() => {
    initMixpanel(MIXPANEL_TOKEN);
  }, []);

  // Step 2: Identify / reset on auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      if (prevUserRef.current !== user.uid) {
        mpIdentify(user.uid, {
          $phone: user.phoneNumber ?? undefined,
        });
        prevUserRef.current = user.uid;
      }
    } else if (!isAuthenticated && prevUserRef.current) {
      // User logged out — reset so next session gets a fresh anonymous ID
      mpReset();
      prevUserRef.current = null;
    }
  }, [isAuthenticated, user]);

  return null;
}
