/**
 * Banner shown at the top of admin pages whose backend isn't wired up yet.
 *
 * Pages that currently mount this banner (mock data only — edits don't
 * persist anywhere real):
 *  - /dashboard/faq
 *  - /dashboard/reviews
 *  - /dashboard/notifications
 *  - /dashboard/seo-content
 *  - /dashboard/settings
 *  - /dashboard/profile
 *
 * The corresponding sidebar entries are also marked `comingSoon: true`
 * (greyed out + "Soon" badge) — see app-sidebar.tsx.
 *
 * Once the backend ships for any of these, remove the banner mount from
 * that page and drop the `comingSoon: true` flag in the sidebar.
 */
"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface ComingSoonBannerProps {
  /** What's not connected yet, e.g. "FAQ backend", "Reviews backend". */
  feature: string;
  /**
   * Optional. If set, the banner shows a "Track this on the SEO roadmap"
   * link to /dashboard/seo-content/onboarding (or wherever else makes
   * sense).
   */
  roadmapHref?: string;
}

export function ComingSoonBanner({
  feature,
  roadmapHref = "/dashboard/seo-content/onboarding",
}: ComingSoonBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 mb-6"
    >
      <AlertTriangle
        className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-600"
        aria-hidden="true"
      />
      <div className="text-sm leading-relaxed">
        <p className="font-semibold mb-0.5">
          🚧 {feature} is being built — your edits won&apos;t save yet.
        </p>
        <p className="text-amber-800">
          You&apos;re seeing the planned UI with placeholder data. Anything you
          create, edit, or delete here is local-only and will reset on refresh.
          Please don&apos;t rely on this page for production content yet.{" "}
          {roadmapHref && (
            <>
              <Link href={roadmapHref} className="underline font-medium">
                See the SEO roadmap
              </Link>{" "}
              for status.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
