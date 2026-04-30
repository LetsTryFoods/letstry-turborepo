'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { pushToDataLayer } from '@/lib/analytics/data-layer';

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
 */
export function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    pushToDataLayer({
      event: 'web_vital',
      metric_name: metric.name,                  // CLS / INP / LCP / FCP / TTFB / FID
      metric_value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value,
      ),
      metric_rating: metric.rating,              // good | needs-improvement | poor
      metric_delta: Math.round(
        metric.name === 'CLS' ? metric.delta * 1000 : metric.delta,
      ),
      metric_id: metric.id,
      metric_navigation_type: (metric as { navigationType?: string }).navigationType,
    });
  });

  return null;
}
