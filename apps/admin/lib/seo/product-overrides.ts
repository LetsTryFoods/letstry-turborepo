/**
 * Mirror of the storefront's hand-written SEO overrides.
 *
 * Source of truth: apps/frontend/src/lib/seo/overrides.ts (productOverrides
 * map). Duplicated here because admin and frontend are separately built
 * Next.js apps and don't share runtime imports — having a copy lets the
 * admin's "live preview" panel compute exactly what the storefront would
 * render WITHOUT making the admin reach across into the frontend bundle.
 *
 * KEEP THIS IN SYNC. Whenever apps/frontend/src/lib/seo/overrides.ts
 * changes, mirror the change here. A future cleanup could move both into
 * a shared monorepo package; that's out of scope for the current sprint.
 */

export interface SeoOverride {
  title: string;
  description: string;
}

export const productOverrides: Record<string, SeoOverride> = {
  "roasted-chana": {
    title: "Roasted Chana – High Protein Snack, No Palm Oil | Let's Try Foods",
    description:
      "Buy roasted chana (bhuna chana) online — high protein, no oil, no palm oil. Crunchy Indian snack from Let's Try Foods. Shipped across India.",
  },
  "garlic-bhujia": {
    title: "Garlic Bhujia Online – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Buy authentic garlic bhujia with no palm oil and no maida. Crunchy, spicy Indian namkeen from Let's Try Foods. Shipped across India.",
  },
  "lets-try-garlic-bhujia": {
    title: "Garlic Bhujia Online – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Buy authentic garlic bhujia with no palm oil and no maida. Crunchy, spicy Indian namkeen from Let's Try Foods. Shipped across India.",
  },
  "lets-try-sev-bhujia": {
    title: "Sev Bhujia – Thin Crispy Bhujia, No Palm Oil | Let's Try Foods",
    description:
      "Buy thin, crispy sev bhujia online with no palm oil and no maida. Authentic Indian namkeen from Let's Try Foods. Shipped across India.",
  },
  sattu: {
    title: "Sattu Online – Roasted Gram Flour, High Protein | Let's Try Foods",
    description:
      "Buy authentic roasted sattu (chana sattu) online — high protein, no additives. Energy-rich summer drink base from Let's Try Foods. Shipped across India.",
  },
  "kettle-cooked-pudina-potato-wafers": {
    title: "Kettle-Cooked Pudina Wafers – No Palm Oil | Let's Try Foods",
    description:
      "Buy kettle-cooked pudina potato wafers online — no palm oil, no maida. Tangy, refreshing Indian potato chips from Let's Try Foods. Shipped across India.",
  },
  "lets-try-ragi-kaju-pista-cookies": {
    title: "Ragi Kaju Pista Cookies – No White Sugar | Let's Try Foods",
    description:
      "Healthy ragi cookies with kaju and pista — no palm oil, no white sugar, no maida. Millet-based biscuits from Let's Try Foods. Shipped across India.",
  },
  "lets-try-oats-coconut-cookies": {
    title: "Oats Coconut Cookies – No Palm Oil, No White Sugar | Let's Try",
    description:
      "Healthy oats and coconut cookies — no palm oil, no white sugar. Wholesome Indian biscuits from Let's Try Foods. Shipped across India.",
  },
  "lets-try-oats-choco-chip-cookies": {
    title: "Oats Choco Chip Cookies – No Palm Oil | Let's Try Foods",
    description:
      "Healthy oats choco chip cookies — no palm oil, no white sugar. Chocolate indulgence made better from Let's Try Foods. Shipped across India.",
  },
  "kerala-garlic-mixture": {
    title: "Kerala Garlic Mixture – No Palm Oil | Let's Try Foods",
    description:
      "Authentic Kerala garlic mixture namkeen — no palm oil, no maida. Crunchy, spicy south-Indian snack from Let's Try Foods. Shipped across India.",
  },
  "navratan-mixture": {
    title: "Navratan Mixture – Premium Namkeen, No Palm Oil | Let's Try",
    description:
      "Buy Navratan mixture online — 9-nut-seed premium namkeen with no palm oil, no maida. From Let's Try Foods. Shipped across India.",
  },
  "sabudana-mixture": {
    title: "Sabudana Mixture – Vrat-Friendly Namkeen, No Palm Oil | Let's Try",
    description:
      "Sabudana mixture namkeen — fasting-friendly, no palm oil, no maida. Crunchy Indian vrat snack from Let's Try Foods. Shipped across India.",
  },
  "peri-peri-makhana": {
    title: "Peri Peri Makhana – Roasted Foxnuts, No Palm Oil | Let's Try Foods",
    description:
      "Roasted peri peri makhana — high protein, no palm oil, no maida. Spicy, crunchy foxnut snack from Let's Try Foods. Shipped across India.",
  },
  "pudina-makhana": {
    title: "Pudina Makhana – Roasted Foxnuts, No Palm Oil | Let's Try Foods",
    description:
      "Roasted pudina makhana — tangy mint flavour, no palm oil, no maida. Healthy foxnut snack from Let's Try Foods. Shipped across India.",
  },
  "lite-chips": {
    title: "Lite Chips – No Palm Oil, Kettle-Cooked Potato Chips | Let's Try",
    description:
      "Lite kettle-cooked potato chips — no palm oil, no maida. Crunchy, guilt-free Indian wafers from Let's Try Foods. Shipped across India.",
  },
  "khatta-meetha": {
    title: "Khatta Meetha Mixture – Classic Namkeen, No Palm Oil | Let's Try",
    description:
      "Buy khatta meetha mixture online — tangy-sweet Indian namkeen with no palm oil, no maida. Classic crunchy snack from Let's Try Foods. Shipped across India.",
  },
  // Purani Delhi range: DO NOT claim "No Maida" — products contain maida.
  "lets-try-purani-delhi-methi-mathri-200g": {
    title: "Purani Delhi Methi Mathri – No Palm Oil | Let's Try Foods",
    description:
      "Authentic Purani Delhi methi mathri — traditional recipe, no palm oil. Crispy savoury Indian snack from Let's Try Foods. Shipped across India.",
  },
  "butter-murukku": {
    title: "Butter Murukku – South Indian Snack, No Palm Oil | Let's Try Foods",
    description:
      "Authentic south-Indian butter murukku — no palm oil, no maida. Crunchy, buttery rice-flour snack from Let's Try Foods. Shipped across India.",
  },
  "masala-boondi": {
    title: "Masala Boondi – Spicy Indian Namkeen, No Palm Oil | Let's Try",
    description:
      "Classic masala boondi — spicy gram-flour namkeen with no palm oil, no maida. Traditional Indian snack from Let's Try Foods. Shipped across India.",
  },
  "vrat-mota-chips": {
    title: "Vrat Mota Chips – Fasting-Friendly, No Palm Oil | Let's Try Foods",
    description:
      "Vrat-friendly thick-cut potato chips — no palm oil, no maida. Perfect for Navratri fasting from Let's Try Foods. Shipped across India.",
  },
};

export function getProductOverride(slug: string): SeoOverride | undefined {
  return productOverrides[slug.toLowerCase()];
}

/**
 * Compute exactly what title + description the storefront's
 * generateMetadata() would render today for a given product, mirroring
 * apps/frontend/src/app/product/[id]/page.tsx resolution chain:
 *   1. CMS product.seo (admin edits)
 *   2. Hardcoded override (this file)
 *   3. Auto-generated default
 *
 * The "source" indicates which path actually wins for the live page —
 * lets the admin show editors which fallback is in effect.
 */
export interface LiveProductSeo {
  title: string;
  description: string;
  titleSource: "cms" | "override" | "default";
  descriptionSource: "cms" | "override" | "default";
}

export interface LiveProductSeoInput {
  name: string;
  slug: string;
  description?: string | null;
  isVegetarian?: boolean | null;
  shelfLife?: string | null;
  defaultPack?: string | null;
  cms: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
}

export function computeLiveProductSeo(
  input: LiveProductSeoInput,
): LiveProductSeo {
  const override = getProductOverride(input.slug);

  // Default title — mirrors apps/frontend/src/app/product/[id]/page.tsx:
  //   `${name} ${pack} – No Palm Oil | Let's Try Foods`
  const titleParts = [
    input.name,
    input.defaultPack || null,
    `– No Palm Oil`,
  ].filter(Boolean);
  const defaultTitle = `${titleParts.join(" ")} | Let's Try Foods`;

  // Default description — mirrors the storefront's logic:
  //   - product.description (or fallback "Buy X online from LTF")
  //   - "Made without palm oil. 100% groundnut oil."
  //   - "100% vegetarian." (if vegetarian)
  //   - "Shelf life: X." (if shelfLife)
  //   - "Shipped across India."
  // Trimmed to 300 chars.
  const descParts: string[] = [];
  if (input.description) {
    descParts.push(input.description);
  } else {
    descParts.push(
      `Buy ${input.name}${input.defaultPack ? ` (${input.defaultPack})` : ""} online from Let's Try Foods.`,
    );
  }
  descParts.push("Made without palm oil. 100% groundnut oil.");
  if (input.isVegetarian) descParts.push("100% vegetarian.");
  if (input.shelfLife) descParts.push(`Shelf life: ${input.shelfLife}.`);
  descParts.push("Shipped across India.");
  const defaultDescription = descParts.join(" ").slice(0, 300);

  // Title resolution: CMS → override → default
  let title = defaultTitle;
  let titleSource: LiveProductSeo["titleSource"] = "default";
  if (input.cms?.metaTitle) {
    title = input.cms.metaTitle;
    titleSource = "cms";
  } else if (override?.title) {
    title = override.title;
    titleSource = "override";
  }

  // Description resolution: same chain
  let description = defaultDescription;
  let descriptionSource: LiveProductSeo["descriptionSource"] = "default";
  if (input.cms?.metaDescription) {
    description = input.cms.metaDescription;
    descriptionSource = "cms";
  } else if (override?.description) {
    description = override.description;
    descriptionSource = "override";
  }

  return { title, description, titleSource, descriptionSource };
}
