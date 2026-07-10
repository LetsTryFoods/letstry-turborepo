// NOTE: We do NOT use a top-level import for mixpanel-browser.
// It accesses `window` at module evaluation time which crashes Next.js SSR.
// All calls lazy-load via require() inside a client-only guard.

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

let _initialized = false;

/** Lazily returns the mixpanel-browser instance — null on SSR. */
function getMixpanel(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const mod = require("mixpanel-browser");
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

/**
 * Initialise Mixpanel once on the client.
 * - autocapture: true   — auto-tracks clicks, form submissions, page views
 * - record_sessions_percent: 100 — full session replay
 * - persistence: localStorage — survives cross-tab navigation
 * - debug: true in development
 */
export const initMixpanel = (token?: string): void => {
  if (typeof window === "undefined") return;
  if (_initialized) return;
  if (!token) {
    console.warn("[Mixpanel] No token — tracking disabled.");
    return;
  }

  const mp = getMixpanel();
  if (!mp) return;

  mp.init(token, {
    autocapture: true,
    record_sessions_percent: 100,
    persistence: "localStorage",
    debug: process.env.NODE_ENV !== "production",
    ignore_dnt: false,
    loaded: (instance: any) => {
      console.log(
        "[Mixpanel] ✅ Initialized. distinct_id:",
        instance.get_distinct_id(),
      );
    },
  });

  _initialized = true;
};

/**
 * Track a named event with optional properties.
 * Silent no-op before init or on server.
 */
export const mpTrack = (event: string, props?: Record<string, any>): void => {
  if (typeof window === "undefined" || !_initialized) return;
  const mp = getMixpanel();
  if (!mp) return;
  try {
    mp.track(event, props);
  } catch (err) {
    console.error("[Mixpanel] track error:", err);
  }
};

/**
 * Link all subsequent events to a known user.
 * Call after successful login.
 */
export const mpIdentify = (
  userId: string,
  traits?: Record<string, any>,
): void => {
  if (typeof window === "undefined" || !_initialized) return;
  const mp = getMixpanel();
  if (!mp) return;
  try {
    mp.identify(userId);
    if (traits) mp.people.set(traits);
  } catch (err) {
    console.error("[Mixpanel] identify error:", err);
  }
};

/**
 * Reset distinct ID on logout — next session gets a fresh anonymous ID.
 */
export const mpReset = (): void => {
  if (typeof window === "undefined" || !_initialized) return;
  const mp = getMixpanel();
  if (!mp) return;
  try {
    mp.reset();
  } catch (err) {
    console.error("[Mixpanel] reset error:", err);
  }
};
