import mixpanel, { type Dict } from "mixpanel-browser";

let _initialized = false;

/**
 * Initialise Mixpanel once on the client.
 * - autocapture captures clicks, form submissions, page views automatically
 * - record_sessions_percent records 100 % of sessions for heatmaps / replay
 * - persistence="localStorage" survives cross-tab navigation (better than cookie)
 * - debug mode is enabled in non-production environments
 */
export const initMixpanel = (token?: string): void => {
  if (typeof window === "undefined") return; // SSR guard
  if (_initialized) return;
  if (!token) {
    console.warn("[Mixpanel] No token provided — tracking disabled.");
    return;
  }

  mixpanel.init(token, {
    autocapture: true,
    record_sessions_percent: 100,
    persistence: "localStorage",
    debug: process.env.NODE_ENV !== "production",
    ignore_dnt: false, // respect Do Not Track
  });

  _initialized = true;
};

/**
 * Track a named event with optional properties.
 * Safe to call before init (events are silently dropped).
 */
export const mpTrack = (event: string, props?: Dict): void => {
  if (typeof window === "undefined" || !_initialized) return;
  try {
    mixpanel.track(event, props);
  } catch (err) {
    console.error("[Mixpanel] track error:", err);
  }
};

/**
 * Link all subsequent events to a known user.
 * Call this after a successful login.
 */
export const mpIdentify = (userId: string, traits?: Dict): void => {
  if (typeof window === "undefined" || !_initialized) return;
  try {
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  } catch (err) {
    console.error("[Mixpanel] identify error:", err);
  }
};

/**
 * Reset the distinct ID on logout so the next session starts fresh.
 */
export const mpReset = (): void => {
  if (typeof window === "undefined" || !_initialized) return;
  try {
    mixpanel.reset();
  } catch (err) {
    console.error("[Mixpanel] reset error:", err);
  }
};
