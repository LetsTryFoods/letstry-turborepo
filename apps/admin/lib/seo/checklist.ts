/**
 * Pre-publish SEO checklist evaluator.
 *
 * Given a content entity (product / category / blog / pillar), returns an
 * array of pass/fail checks the content team can review before publishing.
 * Used by the SEO scorecard panel in the admin and by the monthly
 * scorecard email.
 */

export interface ChecklistItem {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  hint?: string;
}

interface SeoLike {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
}

interface ProductLike {
  name?: string;
  slug?: string;
  description?: string | null;
  longDescription?: string | null;
  ingredients?: string | null;
  shelfLife?: string | null;
  isVegetarian?: boolean | null;
  productFaqs?: { question: string; answer: string }[] | null;
  audience?: string[] | null;
  occasions?: string[] | null;
  pillarSlugs?: string[] | null;
  pros?: { text: string }[] | null;
  cons?: { text: string }[] | null;
  certifications?: { name: string }[] | null;
  lifestyleImages?: { url: string; alt: string }[] | null;
  videoUrl?: string | null;
  nutrition?: { servingSize?: string | null; calories?: string | null } | null;
  variants?: { images?: { url?: string; alt?: string }[] }[];
  seo?: SeoLike | null;
}

const TITLE_MIN = 50;
const TITLE_MAX = 60;
const DESC_MIN = 140;
const DESC_MAX = 160;

export function evaluateProductChecklist(p: ProductLike): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // ---- Core SEO --------------------------------------------------------
  items.push(seoTitleCheck(p.seo?.metaTitle));
  items.push(seoDescriptionCheck(p.seo?.metaDescription));
  items.push(canonicalCheck(p.seo?.canonicalUrl));
  items.push(socialOgCheck(p.seo));

  // ---- Image alt text on every variant image --------------------------
  const allVariantImages = (p.variants || []).flatMap((v) => v.images || []);
  const imagesMissingAlt = allVariantImages.filter(
    (i) => !i.alt || i.alt.trim() === "",
  ).length;
  items.push({
    id: "product-image-alt",
    label: "Every product image has alt text",
    status: imagesMissingAlt === 0 ? "pass" : "fail",
    hint:
      imagesMissingAlt > 0
        ? `${imagesMissingAlt} image(s) are missing alt text. Alt text helps screen readers + image SEO.`
        : undefined,
  });

  // ---- Long description -----------------------------------------------
  const longDescWordCount = (p.longDescription || "")
    .split(/\s+/)
    .filter(Boolean).length;
  items.push({
    id: "product-long-description",
    label: "Long description has 200+ words",
    status:
      longDescWordCount >= 200
        ? "pass"
        : longDescWordCount >= 80
          ? "warn"
          : "fail",
    hint:
      longDescWordCount === 0
        ? "Add a Long Description in the Rich Content tab — 300-800 words is ideal."
        : `Currently ${longDescWordCount} words.`,
  });

  // ---- FAQs ------------------------------------------------------------
  const faqCount = (p.productFaqs || []).length;
  items.push({
    id: "product-faqs",
    label: "At least 3 CMS-authored FAQs",
    status: faqCount >= 3 ? "pass" : faqCount >= 1 ? "warn" : "fail",
    hint:
      faqCount === 0
        ? "Even though FAQs are auto-generated, hand-authored FAQs improve quoting rates by AI engines."
        : `Currently ${faqCount} CMS FAQs.`,
  });

  // ---- Pillar association ---------------------------------------------
  items.push({
    id: "product-pillar",
    label: "Linked to at least one pillar",
    status: (p.pillarSlugs || []).length > 0 ? "pass" : "warn",
    hint: "Pillar association drives breadcrumb chain (Home > Pillar > Cat > Product) and pillar feature sections.",
  });

  // ---- Audience tagging ------------------------------------------------
  items.push({
    id: "product-audience",
    label: "Audience tags set (kids / fitness / vrat / gifting / diabetic)",
    status: (p.audience || []).length > 0 ? "pass" : "warn",
    hint: "Audience tags unlock conversational FAQ generation + Schema.org audience.",
  });

  // ---- Pros / cons -----------------------------------------------------
  items.push({
    id: "product-pros-cons",
    label: "Pros and cons captured",
    status:
      (p.pros || []).length >= 3 && (p.cons || []).length >= 1
        ? "pass"
        : "warn",
    hint: 'Google now emits a "pros & cons" rich result; both arrays should be populated honestly.',
  });

  // ---- Nutrition -------------------------------------------------------
  const hasNutrition =
    p.nutrition && (p.nutrition.calories || p.nutrition.servingSize);
  items.push({
    id: "product-nutrition",
    label: "Nutrition table filled",
    status: hasNutrition ? "pass" : "warn",
    hint: "Drives Schema.org NutritionInformation rich result for food products.",
  });

  // ---- Certifications --------------------------------------------------
  items.push({
    id: "product-certifications",
    label: "At least one certification (FSSAI etc.)",
    status: (p.certifications || []).length > 0 ? "pass" : "warn",
    hint: "Visible trust badge above CTA + Schema.org award.",
  });

  // ---- Lifestyle images ------------------------------------------------
  items.push({
    id: "product-lifestyle",
    label: "At least 2 lifestyle images",
    status: (p.lifestyleImages || []).length >= 2 ? "pass" : "warn",
    hint: "Lifestyle shots drive Pinterest + image-search discovery.",
  });

  return items;
}

function seoTitleCheck(title?: string | null): ChecklistItem {
  if (!title || title.trim() === "") {
    return {
      id: "seo-title",
      label: "Meta title is set",
      status: "fail",
      hint: "Without a CMS title the page falls back to a templated default. Hand-written titles outperform fallbacks for non-branded queries.",
    };
  }
  const len = title.length;
  if (len < TITLE_MIN) {
    return {
      id: "seo-title",
      label: `Meta title is set (${len} chars)`,
      status: "warn",
      hint: `Aim for ${TITLE_MIN}-${TITLE_MAX} characters so Google doesn't truncate.`,
    };
  }
  if (len > TITLE_MAX) {
    return {
      id: "seo-title",
      label: `Meta title is set (${len} chars)`,
      status: "warn",
      hint: `Over ${TITLE_MAX} chars — Google may truncate.`,
    };
  }
  return {
    id: "seo-title",
    label: `Meta title is set (${len} chars)`,
    status: "pass",
  };
}

function seoDescriptionCheck(desc?: string | null): ChecklistItem {
  if (!desc || desc.trim() === "") {
    return {
      id: "seo-description",
      label: "Meta description is set",
      status: "fail",
      hint: "A hand-written description sells the click. Aim for 150-160 chars including the USP.",
    };
  }
  const len = desc.length;
  if (len < DESC_MIN) {
    return {
      id: "seo-description",
      label: `Meta description is set (${len} chars)`,
      status: "warn",
      hint: `Could be longer — aim for ${DESC_MIN}-${DESC_MAX} chars.`,
    };
  }
  if (len > DESC_MAX) {
    return {
      id: "seo-description",
      label: `Meta description is set (${len} chars)`,
      status: "warn",
      hint: `Over ${DESC_MAX} chars — Google may truncate.`,
    };
  }
  return {
    id: "seo-description",
    label: `Meta description is set (${len} chars)`,
    status: "pass",
  };
}

function canonicalCheck(canonical?: string | null): ChecklistItem {
  return {
    id: "seo-canonical",
    label: "Canonical URL is set",
    status: canonical && canonical.trim() !== "" ? "pass" : "warn",
    hint: canonical
      ? undefined
      : "A page-level canonical isn't required (the template generates one) but setting it explicitly removes ambiguity.",
  };
}

function socialOgCheck(seo?: SeoLike | null): ChecklistItem {
  const hasOgImage = !!seo?.ogImage;
  return {
    id: "seo-og-image",
    label: "Open Graph image is set",
    status: hasOgImage ? "pass" : "warn",
    hint: hasOgImage
      ? undefined
      : "Without a custom OG image the storefront falls back to the variant thumbnail, which is often packshot-on-white. A lifestyle shot performs better when shared on WhatsApp / X / FB.",
  };
}

/**
 * Reduce a checklist to a 0-100 score for the dashboard summary.
 * Pass = full credit. Warn = half credit. Fail = no credit.
 */
export function scoreChecklist(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((acc, i) => {
    if (i.status === "pass") return acc + 1;
    if (i.status === "warn") return acc + 0.5;
    return acc;
  }, 0);
  return Math.round((total / items.length) * 100);
}
