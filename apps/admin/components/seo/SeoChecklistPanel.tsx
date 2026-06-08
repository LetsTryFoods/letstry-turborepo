"use client";

import {
  evaluateProductChecklist,
  scoreChecklist,
  type ChecklistItem,
} from "@/lib/seo/checklist";

/**
 * Visual SEO checklist drop-in for the product edit page.
 *
 * Pass the live form values (or the fetched product) and it'll render
 * a scrollable list with traffic-light status + actionable hints.
 *
 * Designed for non-technical content folks: every "fail" / "warn" item
 * tells them WHAT to do, not WHY (the why is in the onboarding doc).
 */
export function SeoChecklistPanel({
  product,
  className,
}: {
  product: Parameters<typeof evaluateProductChecklist>[0];
  className?: string;
}) {
  const items = evaluateProductChecklist(product);
  const score = scoreChecklist(items);

  return (
    <aside
      className={`rounded-xl border border-gray-200 bg-white p-4 ${className || ""}`}
      aria-label="SEO readiness checklist"
    >
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">SEO readiness</h3>
        <ScoreBadge score={score} />
      </header>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <ChecklistRow key={it.id} item={it} />
        ))}
      </ul>
      <p className="mt-3 text-xs text-gray-500">
        Aim for a score of 80+ before publishing. See the{" "}
        <a href="/dashboard/seo-content/onboarding" className="underline">
          content onboarding guide
        </a>{" "}
        for what each check means.
      </p>
    </aside>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const dot = {
    pass: "bg-emerald-500",
    warn: "bg-amber-500",
    fail: "bg-red-500",
  }[item.status];
  return (
    <li className="flex gap-2 items-start">
      <span
        className={`mt-1.5 inline-block w-2 h-2 rounded-full ${dot}`}
        aria-hidden
      />
      <div className="flex-1">
        <p className="text-gray-900">{item.label}</p>
        {item.hint && (
          <p className="text-xs text-gray-500 mt-0.5">{item.hint}</p>
        )}
      </div>
    </li>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 80 ? "emerald" : score >= 50 ? "amber" : "red";
  const cls = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }[tone];
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}
    >
      {score}/100
    </span>
  );
}
