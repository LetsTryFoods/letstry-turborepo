/**
 * UTM Capture Utility
 * Reads UTM params from URL on landing and saves them to sessionStorage.
 * These are then attached to the purchase event for reliable attribution.
 */

const UTM_KEY = "captured_utm_params";

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Call this on initial page load.
 * Reads UTM params from current URL and saves to sessionStorage.
 * Does NOT overwrite if UTM was already captured in this session.
 */
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;

  // Don't overwrite existing UTM for this session (first touch wins)
  if (sessionStorage.getItem(UTM_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};

  if (params.get("utm_source")) utm.utm_source = params.get("utm_source")!;
  if (params.get("utm_medium")) utm.utm_medium = params.get("utm_medium")!;
  if (params.get("utm_campaign")) utm.utm_campaign = params.get("utm_campaign")!;
  if (params.get("utm_term")) utm.utm_term = params.get("utm_term")!;
  if (params.get("utm_content")) utm.utm_content = params.get("utm_content")!;

  // Only save if at least one UTM param is present
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }
}

/**
 * Returns saved UTM params for the current session.
 */
export function getSavedUtmParams(): UtmParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
