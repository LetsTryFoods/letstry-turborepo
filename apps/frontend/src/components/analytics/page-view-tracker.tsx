"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAnalytics } from "@/hooks/use-analytics";
import { captureUtmParams } from "@/lib/analytics/utm-capture";

// Params that represent in-page filtering/search — not a new page visit.
// Changes to these should NOT fire page_view (they have their own events).
const SEARCH_PARAMS_TO_IGNORE = new Set(["q"]);

/**
 * Fires a `page_view` event on route changes, but deliberately ignores
 * changes to search/filter params (e.g. `?q=`) that update the URL
 * without the user navigating to a new page. Those interactions are
 * tracked by dedicated events like `search` instead.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useAnalytics();

  // Track the last pathname we fired page_view for so we can compare
  const lastPathnameRef = useRef<string | null>(null);
  // Track first render to send full URL (with UTM) on initial load
  const isFirstRender = useRef<boolean>(true);

  // Build a stable key from only the params we care about (excluding q, etc.)
  const filteredParamsKey = (() => {
    if (!searchParams) return "";
    const copy = new URLSearchParams(searchParams.toString());
    SEARCH_PARAMS_TO_IGNORE.forEach((key) => copy.delete(key));
    return copy.toString();
  })();

  useEffect(() => {
    if (!pathname) return;

    const isNewPage =
      lastPathnameRef.current === null || lastPathnameRef.current !== pathname;

    // Capture UTM params on very first page load
    if (isFirstRender.current) {
      captureUtmParams();
    }

    if (isNewPage) {
      lastPathnameRef.current = pathname;
      // Search page tracks itself via the `search` event — skip page_view there.
      if (pathname === "/search") return;

      // On the very first page load (isFirstRender), use the full URL (including UTM params)
      // so GA4 can attribute the session source correctly.
      // On subsequent navigations, use the clean path without UTM clutter.
      const url =
        isFirstRender.current && typeof window !== "undefined"
          ? window.location.href
          : pathname + (filteredParamsKey ? `?${filteredParamsKey}` : "");

      isFirstRender.current = false;
      trackPageView(url);
    }
    // filteredParamsKey intentionally included so non-search param changes still fire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, filteredParamsKey, trackPageView]);

  return null;
}
