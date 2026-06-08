"use client";

import { useReportWebVitals } from "next/web-vitals";
import { pushToDataLayer } from "@/lib/analytics/data-layer";

/**
 * Streams Core Web Vitals to GA4 via the GTM dataLayer.
 *
 * Why: GA4's auto-collected web-vitals are sample-based and lag the SERP-side
 * CrUX dataset. Pushing them ourselves on every navigation gives us
 * field-data parity with what Google Search Console reports, lets us split
 * by route, and surfaces regressions (especially INP under Next 16) before
 * they show up in CrUX a month later.
 *
 * Each metric becomes a `web_vital` event with metric name, value, rating
 * (good/needs-improvement/poor), and the navigation/render id. Configure a
 * GTM trigger on event=web_vital to forward to GA4 as a custom event.
 *
 * Implementation note: Next's exported NextWebVitalsMetric type only
 * declares { id, name, value, label, startTime }. The underlying
 * `web-vitals` library populates richer fields at runtime (rating,
 * delta, navigationType) which Next forwards as-is but doesn't type.
 * We cast through a local FullMetric shape to access those fields
 * without `any` and without a tsconfig change.
 */

interface FullMetric {
  id: string;
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  delta?: number;
  navigationType?: string;
}

export function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    const m = metric as unknown as FullMetric;
    const isCls = m.name === "CLS";

    pushToDataLayer({
      event: "web_vital",
      metric_name: m.name,
      metric_value: Math.round(isCls ? m.value * 1000 : m.value),
      metric_rating: m.rating,
      metric_delta:
        typeof m.delta === "number"
          ? Math.round(isCls ? m.delta * 1000 : m.delta)
          : undefined,
      metric_id: m.id,
      metric_navigation_type: m.navigationType,
    });
  });

  return null;
}
