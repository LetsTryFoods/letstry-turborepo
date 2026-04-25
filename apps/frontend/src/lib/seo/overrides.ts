/**
 * Hand-written SEO overrides for top-traffic categories and products.
 *
 * Drafted 2026-04-25 based on GSC/GA4 diagnostic: these are the slugs that
 * either pull significant impressions today or drive GA4-recorded revenue.
 * Every override below follows the brand-claim matrix approved by the SEO
 * owner:
 *   - "No Palm Oil" is safe everywhere.
 *   - "No Maida" is NOT used on Purani Delhi or Rusk ranges.
 *   - "No Refined Sugar" is only used on the Cookies range.
 *
 * Lookup order in generateMetadata:
 *   1. CMS seo.metaTitle / seo.metaDescription (if admin populates them)
 *   2. This override map
 *   3. Data-driven fallback template
 */

export interface SeoOverride {
  title: string;
  description: string;
}

export const categoryOverrides: Record<string, SeoOverride> = {
  'bhujia': {
    title: "Bhujia Online – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Buy authentic Indian bhujia online with no palm oil and no maida. Garlic, sev, khatta meetha and more — shipped across India from Delhi.",
  },
  'cookies': {
    title: "Healthy Cookies – No Palm Oil, No Refined Sugar | Let's Try",
    description:
      "Shop healthy Indian cookies with no palm oil and no refined sugar. Ragi, oats, jowar and millet cookies from Let's Try Foods. Shipped across India.",
  },
  'rusk': {
    title: "Buy Rusk Online – Cake Rusk, Fruit Cake Rusk | Let's Try Foods",
    description:
      "Buy Indian rusk and cake rusks online with no palm oil. Fruit cake rusk, almond-kaju cake rusk, classic cake rusk — shipped across India.",
  },
  'makhana': {
    title: "Flavoured Makhana Online – No Palm Oil, Roasted | Let's Try",
    description:
      "Buy roasted flavoured makhana with no palm oil and no maida. Peri peri, pudina, Himalayan salt, lime chilli — shipped across India from Let's Try.",
  },
  'healthy-snacks': {
    title: "Healthy Indian Snacks Online – No Palm Oil, No Maida | Let's Try",
    description:
      "Shop healthy Indian snacks with no palm oil and no maida. Ragi, jowar, makhana, roasted chana, millet-based namkeen — shipped across India.",
  },
  'fasting-special': {
    title: "Vrat / Fasting Snacks – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Shop vrat / fasting snacks online. Sabudana, makhana, kuttu, singhara, vrat chips — no palm oil, no maida, Navratri-approved. From Let's Try Foods.",
  },
  'purani-delhi': {
    title: "Purani Delhi Snacks – Authentic Recipes, No Palm Oil | Let's Try",
    description:
      "Traditional Purani Delhi snacks from Let's Try Foods — soan papdi, khari, methi mathri, kaju katli. Authentic recipes with no palm oil. Delivered across India.",
  },
};

export const productOverrides: Record<string, SeoOverride> = {
  'roasted-chana': {
    title: "Roasted Chana – High Protein Snack, No Palm Oil | Let's Try Foods",
    description:
      "Buy roasted chana (bhuna chana) online — high protein, no oil, no palm oil. Crunchy Indian snack from Let's Try Foods. Shipped across India.",
  },
  'garlic-bhujia': {
    title: "Garlic Bhujia Online – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Buy authentic garlic bhujia with no palm oil and no maida. Crunchy, spicy Indian namkeen from Let's Try Foods. Shipped across India.",
  },
  'lets-try-garlic-bhujia': {
    title: "Garlic Bhujia Online – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Buy authentic garlic bhujia with no palm oil and no maida. Crunchy, spicy Indian namkeen from Let's Try Foods. Shipped across India.",
  },
  'lets-try-sev-bhujia': {
    title: "Sev Bhujia – Thin Crispy Bhujia, No Palm Oil | Let's Try Foods",
    description:
      "Buy thin, crispy sev bhujia online with no palm oil and no maida. Authentic Indian namkeen from Let's Try Foods. Shipped across India.",
  },
  'sattu': {
    title: "Sattu Online – Roasted Gram Flour, High Protein | Let's Try Foods",
    description:
      "Buy authentic roasted sattu (chana sattu) online — high protein, no additives. Energy-rich summer drink base from Let's Try Foods. Shipped across India.",
  },
  'kettle-cooked-pudina-potato-wafers': {
    title: "Kettle-Cooked Pudina Wafers – No Palm Oil | Let's Try Foods",
    description:
      "Buy kettle-cooked pudina potato wafers online — no palm oil, no maida. Tangy, refreshing Indian potato chips from Let's Try Foods. Shipped across India.",
  },
  'lets-try-ragi-kaju-pista-cookies': {
    title: "Ragi Kaju Pista Cookies – No Refined Sugar | Let's Try Foods",
    description:
      "Healthy ragi cookies with kaju and pista — no palm oil, no refined sugar, no maida. Millet-based biscuits from Let's Try Foods. Shipped across India.",
  },
  'lets-try-oats-coconut-cookies': {
    title: "Oats Coconut Cookies – No Palm Oil, No Refined Sugar | Let's Try",
    description:
      "Healthy oats and coconut cookies — no palm oil, no refined sugar. Wholesome Indian biscuits from Let's Try Foods. Shipped across India.",
  },
  'lets-try-oats-choco-chip-cookies': {
    title: "Oats Choco Chip Cookies – No Palm Oil | Let's Try Foods",
    description:
      "Healthy oats choco chip cookies — no palm oil, no refined sugar. Chocolate indulgence made better from Let's Try Foods. Shipped across India.",
  },
  'kerala-garlic-mixture': {
    title: "Kerala Garlic Mixture – No Palm Oil | Let's Try Foods",
    description:
      "Authentic Kerala garlic mixture namkeen — no palm oil, no maida. Crunchy, spicy south-Indian snack from Let's Try Foods. Shipped across India.",
  },
  'navratan-mixture': {
    title: "Navratan Mixture – Premium Namkeen, No Palm Oil | Let's Try",
    description:
      "Buy Navratan mixture online — 9-nut-seed premium namkeen with no palm oil, no maida. From Let's Try Foods. Shipped across India.",
  },
  'sabudana-mixture': {
    title: "Sabudana Mixture – Vrat-Friendly Namkeen, No Palm Oil | Let's Try",
    description:
      "Sabudana mixture namkeen — fasting-friendly, no palm oil, no maida. Crunchy Indian vrat snack from Let's Try Foods. Shipped across India.",
  },
  'peri-peri-makhana': {
    title: "Peri Peri Makhana – Roasted Foxnuts, No Palm Oil | Let's Try Foods",
    description:
      "Roasted peri peri makhana — high protein, no palm oil, no maida. Spicy, crunchy foxnut snack from Let's Try Foods. Shipped across India.",
  },
  'pudina-makhana': {
    title: "Pudina Makhana – Roasted Foxnuts, No Palm Oil | Let's Try Foods",
    description:
      "Roasted pudina makhana — tangy mint flavour, no palm oil, no maida. Healthy foxnut snack from Let's Try Foods. Shipped across India.",
  },
  'lite-chips': {
    title: "Lite Chips – No Palm Oil, Kettle-Cooked Potato Chips | Let's Try",
    description:
      "Lite kettle-cooked potato chips — no palm oil, no maida. Crunchy, guilt-free Indian wafers from Let's Try Foods. Shipped across India.",
  },
  'khatta-meetha': {
    title: "Khatta Meetha Mixture – Classic Namkeen, No Palm Oil | Let's Try",
    description:
      "Buy khatta meetha mixture online — tangy-sweet Indian namkeen with no palm oil, no maida. Classic crunchy snack from Let's Try Foods. Shipped across India.",
  },
  // Purani Delhi range: DO NOT claim "No Maida" — products contain maida.
  'lets-try-purani-delhi-methi-mathri-200g': {
    title: "Purani Delhi Methi Mathri – No Palm Oil | Let's Try Foods",
    description:
      "Authentic Purani Delhi methi mathri — traditional recipe, no palm oil. Crispy savoury Indian snack from Let's Try Foods. Shipped across India.",
  },
  'butter-murukku': {
    title: "Butter Murukku – South Indian Snack, No Palm Oil | Let's Try Foods",
    description:
      "Authentic south-Indian butter murukku — no palm oil, no maida. Crunchy, buttery rice-flour snack from Let's Try Foods. Shipped across India.",
  },
  'masala-boondi': {
    title: "Masala Boondi – Spicy Indian Namkeen, No Palm Oil | Let's Try",
    description:
      "Classic masala boondi — spicy gram-flour namkeen with no palm oil, no maida. Traditional Indian snack from Let's Try Foods. Shipped across India.",
  },
  'vrat-mota-chips': {
    title: "Vrat Mota Chips – Fasting-Friendly, No Palm Oil | Let's Try Foods",
    description:
      "Vrat-friendly thick-cut potato chips — no palm oil, no maida. Perfect for Navratri fasting from Let's Try Foods. Shipped across India.",
  },
};

export function getCategoryOverride(slug: string): SeoOverride | undefined {
  return categoryOverrides[slug.toLowerCase()];
}

export function getProductOverride(slug: string): SeoOverride | undefined {
  return productOverrides[slug.toLowerCase()];
}
