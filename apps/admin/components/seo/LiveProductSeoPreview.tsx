/**
 * Read-only panel mounted next to the Product SEO edit form. Shows the
 * EXACT title and description the storefront is currently rendering on
 * the live product page.
 *
 * Why this exists: editors were confused by the gap between "blank fields
 * in admin" and "non-empty title on live page". The storefront has a
 * fallback chain (CMS → hardcoded override → auto-generated default) that
 * the admin form never showed. This panel makes that chain visible, so
 * editors can see what they're overriding before they save.
 *
 * Source-of-truth tag explains which fallback the live page is using:
 *   • "CMS"      → your saved metaTitle/metaDescription is winning
 *   • "Override" → a hand-coded entry in lib/seo/overrides.ts is winning
 *                  because the CMS field is empty
 *   • "Default"  → an auto-generated fallback is winning because both CMS
 *                  and override are empty
 */
"use client";

import { useMemo } from "react";
import {
  computeLiveProductSeo,
  type LiveProductSeoInput,
} from "@/lib/seo/product-overrides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiveProductSeoPreviewProps {
  product: {
    name: string;
    slug: string;
    description?: string | null;
    isVegetarian?: boolean | null;
    shelfLife?: string | null;
    variants?: Array<{
      packageSize?: string | null;
      weight?: number | null;
      weightUnit?: string | null;
      isDefault?: boolean | null;
    }>;
  };
  /**
   * The CMS-saved values currently on this product. Pass `null` if no
   * ProductSeo entry exists for this product yet.
   */
  cms: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
}

function getDefaultPack(
  product: LiveProductSeoPreviewProps["product"],
): string | null {
  const defaultVariant =
    product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  if (!defaultVariant) return null;
  if (defaultVariant.packageSize) return defaultVariant.packageSize;
  if (defaultVariant.weight && defaultVariant.weightUnit) {
    return `${defaultVariant.weight}${defaultVariant.weightUnit}`;
  }
  return null;
}

const SOURCE_BADGE: Record<
  "cms" | "override" | "default",
  { label: string; className: string; hint: string }
> = {
  cms: {
    label: "CMS",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    hint: "Your saved value — editing here will change the live page.",
  },
  override: {
    label: "Override",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    hint: "Hand-coded fallback in lib/seo/overrides.ts. Saving here will replace it on the live page.",
  },
  default: {
    label: "Default",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    hint: "Auto-generated from product name + brand claims. Saving here will replace it on the live page.",
  },
};

export function LiveProductSeoPreview({
  product,
  cms,
}: LiveProductSeoPreviewProps) {
  const live = useMemo(() => {
    const input: LiveProductSeoInput = {
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      isVegetarian: product.isVegetarian ?? null,
      shelfLife: product.shelfLife ?? null,
      defaultPack: getDefaultPack(product),
      cms,
    };
    return computeLiveProductSeo(input);
  }, [product, cms]);

  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Currently shown on live page
        </CardTitle>
        <p className="text-xs text-gray-600 leading-relaxed">
          This is exactly what{" "}
          <code>letstryfoods.com/product/{product.slug}</code> is rendering
          right now. Source tags show which fallback is in effect.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <SeoField label="Title" value={live.title} source={live.titleSource} />
        <SeoField
          label="Description"
          value={live.description}
          source={live.descriptionSource}
        />
      </CardContent>
    </Card>
  );
}

function SeoField({
  label,
  value,
  source,
}: {
  label: string;
  value: string;
  source: "cms" | "override" | "default";
}) {
  const badge = SOURCE_BADGE[source];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
          {label}
        </span>
        <span
          className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${badge.className}`}
          title={badge.hint}
        >
          {badge.label}
        </span>
      </div>
      <p className="text-sm text-gray-900 font-medium leading-snug">{value}</p>
      <p className="text-xs text-gray-500">{badge.hint}</p>
    </div>
  );
}
