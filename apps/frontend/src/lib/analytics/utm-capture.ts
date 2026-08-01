/**
 * UTM Capture Utility
 * Reads UTM params + referrer on landing and saves to sessionStorage.
 * Works on ANY page the user lands on (not just homepage).
 * These are attached to the purchase event and sent to backend at checkout.
 */

const UTM_KEY = "captured_utm_params";

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  sourceLabel: string;
  referrer?: string;
}

/**
 * Derives a human-readable source label from UTM params and/or browser referrer.
 * Priority: UTM params > fbclid/gclid > referrer > "Direct"
 */
function deriveSourceLabel(
  utm: Partial<UtmParams>,
  referrer: string
): string {
  // If UTM source is set, use it directly
  if (utm.utm_source) {
    const source = utm.utm_source;
    const medium = utm.utm_medium || "";
    return medium ? `${source} / ${medium}` : source;
  }

  // fbclid → Meta Paid
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fbclid")) return "Meta / Paid";
    if (params.get("gclid")) return "Google / Paid";
    if (params.get("ttclid")) return "TikTok / Paid";
  }

  // Referrer-based detection
  if (referrer) {
    try {
      const host = new URL(referrer).hostname.replace(/^www\./, "");
      if (host.includes("google.")) return "Google / Organic";
      if (host.includes("facebook.com") || host.includes("fb.com"))
        return "Meta / Referral";
      if (host.includes("instagram.com")) return "Instagram / Referral";
      if (host.includes("youtube.com")) return "YouTube / Referral";
      if (host.includes("twitter.com") || host.includes("x.com"))
        return "Twitter / Referral";
      if (host.includes("whatsapp.com")) return "WhatsApp / Referral";
      return `${host} / Referral`;
    } catch {
      // ignore invalid referrer
    }
  }

  return "Direct";
}

/**
 * Call this on initial page load (done via PageViewTracker).
 * Reads UTM params from current URL and saves to sessionStorage.
 * Does NOT overwrite if UTM was already captured in this session (first touch wins).
 */
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;

  // Don't overwrite existing UTM for this session (first touch wins)
  if (sessionStorage.getItem(UTM_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || "";

  const utm: Partial<UtmParams> = {};
  if (params.get("utm_source")) utm.utm_source = params.get("utm_source")!;
  if (params.get("utm_medium")) utm.utm_medium = params.get("utm_medium")!;
  if (params.get("utm_campaign")) utm.utm_campaign = params.get("utm_campaign")!;
  if (params.get("utm_term")) utm.utm_term = params.get("utm_term")!;
  if (params.get("utm_content")) utm.utm_content = params.get("utm_content")!;

  const sourceLabel = deriveSourceLabel(utm, referrer);

  const captured: UtmParams = {
    ...utm,
    sourceLabel,
    referrer: referrer || undefined,
  };

  try {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(captured));
  } catch {
    // sessionStorage unavailable
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
