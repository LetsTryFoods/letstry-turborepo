/**
 * Hand-written SEO overrides for top-traffic categories and products.
 *
 * Drafted 2026-04-25 based on GSC/GA4 diagnostic: these are the slugs that
 * either pull significant impressions today or drive GA4-recorded revenue.
 *
 * Brand-claim and language conventions (last revised 2026-04-25, Sprint 1c
 * audit pass — see project_brand_claims_matrix.md):
 *   - "No Palm Oil" is safe everywhere.
 *   - "No Maida" is the safest claim on /cookies and /rusk; for the bhujia,
 *     makhana, healthy-snacks and fasting-special meta titles the SEO owner
 *     chose to keep existing live "No Maida" claims rather than risk SEO
 *     churn from a rewrite. Future *new* on-page copy in those categories
 *     does NOT lead with "No Maida".
 *   - Cookies use "No White Sugar" rather than "No Refined Sugar" — the
 *     preferred brand term going forward.
 *   - Frying-oil narrative: lead with "no palm oil"; do not name the
 *     alternative oil in NEW copy. (The brand DOES use 100% groundnut oil,
 *     and existing /about-us, blog and product-blurb copy says so —
 *     those existing surfaces are intentionally untouched.)
 *
 * Each override may also carry on-page content (Sprint 1c):
 *   - h1 / tagline: visible above the product grid
 *   - aboutHeading / about: paragraphs below the product grid
 *   - faqs: rendered below the about block AND emitted as FAQPage JSON-LD
 *
 * Lookup order in generateMetadata:
 *   1. CMS seo.metaTitle / seo.metaDescription (if admin populates them)
 *   2. This override map
 *   3. Data-driven fallback template
 */

export interface SeoOverride {
  title: string;
  description: string;
  /** Optional H1 override. Defaults to category.name when omitted. */
  h1?: string;
  /** One-line tagline shown directly under the H1. ~10–15 words. */
  tagline?: string;
  /** Optional heading for the "about" block below the product grid. Defaults to "About <category name>". */
  aboutHeading?: string;
  /** Paragraphs rendered below the product grid. Each entry is one paragraph. */
  about?: string[];
  /**
   * FAQs rendered below the about block AND emitted as FAQPage JSON-LD for rich snippets.
   * Order is preserved on page and in schema.
   */
  faqs?: Array<{ q: string; a: string }>;
}

export const categoryOverrides: Record<string, SeoOverride> = {
  'bhujia': {
    title: "Bhujia Online – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Buy authentic Indian bhujia online with no palm oil and no maida. Garlic, sev, khatta meetha and more — shipped across India from Delhi.",
    // Sprint 1c on-page content (user-approved 2026-04-25)
    tagline: "Authentic Indian bhujia and namkeen with no palm oil.",
    aboutHeading: "About our bhujia",
    about: [
      "Most mass-market Indian bhujia is fried in palm oil because it's cheap and extends shelf life. We don't use palm oil in any of ours. The range spans the classics — garlic, sev, khatta meetha — alongside regional namkeen like Kerala garlic mixture and Navratan mixture.",
      "Whether you want a sharp, spicy bhujia for chai-time or a milder mix for the snack drawer, the line-up below ships across India.",
    ],
    faqs: [
      {
        q: "Is this bhujia free of palm oil?",
        a: "Yes. We don't use palm oil in any product across the bhujia range.",
      },
      {
        q: "What kinds of bhujia and namkeen are in the range?",
        a: "The range includes garlic bhujia, sev bhujia, khatta meetha, Kerala garlic mixture, Navratan mixture, sabudana mixture and masala boondi.",
      },
      {
        q: "Do you ship bhujia across India?",
        a: "Yes — we do PAN India shipments. Order on letstryfoods.com.",
      },
      {
        q: "Is the bhujia spicy?",
        a: "Spice levels vary across the range — garlic bhujia and Kerala garlic mixture are sharper, khatta meetha is tangy-sweet, and Navratan is a milder, premium mix.",
      },
    ],
  },
  'cookies': {
    title: "Healthy Cookies – No Palm Oil, No White Sugar | Let's Try",
    description:
      "Shop healthy Indian cookies with no palm oil and no white sugar. Ragi, oats, jowar and millet cookies from Let's Try Foods. Shipped across India.",
    // Sprint 1c on-page content (user-approved 2026-04-25)
    h1: "Healthy Cookies",
    tagline: "Premium cookies with no palm oil, no maida and no white sugar.",
    aboutHeading: "About our cookies",
    about: [
      "Most mass-market biscuits in India use palm oil, maida and refined sugar — three ingredients we don't use. Our cookies have no palm oil, made on a base of whole wheat flour, oats or millet, with no white sugar.",
      "The range covers everyday cravings: Ragi Kaju Pista for better snacking, Oats Coconut and Oats Choco Chip for indulgence. Order online and we ship across India.",
    ],
    faqs: [
      {
        q: "Are Let's Try cookies free of palm oil?",
        a: "Yes. We don't use palm oil in any product.",
      },
      {
        q: "Do you use white sugar in your cookies?",
        a: "No. Our cookies are made without white sugar.",
      },
      {
        q: "Are these cookies maida-free?",
        a: "Yes. The cookies range is made with whole wheat flour or millet — no maida (refined wheat flour).",
      },
      {
        q: "What kinds of cookies are in the range?",
        a: "We make oats, ragi and millet-based cookies — including Ragi Kaju Pista, Oats Coconut and Oats Choco Chip. All are baked without palm oil or maida.",
      },
    ],
  },
  'rusk': {
    title: "Buy Rusk Online – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Buy Indian rusk and cake rusks online with no palm oil and no maida — made with 100% atta. Fruit cake rusk, almond-kaju cake rusk, classic cake rusk — shipped across India.",
    // Sprint 1c on-page content (user-approved 2026-04-25)
    tagline: "Cake rusks made with 100% atta — no maida, no palm oil.",
    aboutHeading: "About our rusks",
    about: [
      "Most rusks in the market are made with maida (refined wheat flour) and palm oil. Ours are made with 100% atta — whole wheat — and no palm oil. Same chai-time crunch, fewer trade-offs.",
      "The range covers the classics: classic cake rusk, fruit cake rusk and almond-kaju cake rusk. They pair well with morning chai, evening filter coffee, or whatever you dunk yours into.",
    ],
    faqs: [
      {
        q: "Is this rusk made with maida?",
        a: "No. Our rusks are made with 100% atta (whole wheat) — no maida.",
      },
      {
        q: "Do you use palm oil in your rusks?",
        a: "No. None of our rusks contain palm oil.",
      },
      {
        q: "What flavours of cake rusk do you make?",
        a: "We make classic cake rusk, fruit cake rusk and almond-kaju cake rusk.",
      },
      {
        q: "Do you ship rusks across India?",
        a: "Yes — we do PAN India shipments. Order on letstryfoods.com.",
      },
    ],
  },
  'makhana': {
    title: "Flavoured Makhana Online – No Palm Oil, Roasted | Let's Try",
    description:
      "Buy roasted flavoured makhana with no palm oil and no maida. Peri peri, pudina, Himalayan salt, lime chilli — shipped across India from Let's Try.",
    // Sprint 1c on-page content (user-approved 2026-04-25)
    tagline: "Roasted flavoured makhana with no palm oil — not fried.",
    aboutHeading: "About our makhana",
    about: [
      "Most flavoured makhana in the market is deep-fried in palm oil. Ours is roasted, not fried — and made without palm oil. The range covers everyday flavours like Peri Peri and Pudina, and works as a lighter alternative to chips for tea-time or work-from-home snacking.",
      "Order online and we do PAN India shipments.",
    ],
    faqs: [
      {
        q: "Is your makhana fried or roasted?",
        a: "Roasted. We don't deep-fry our makhana — they're roasted to keep them light and crunchy.",
      },
      {
        q: "Is the makhana free of palm oil?",
        a: "Yes. We don't use palm oil in any of our makhana.",
      },
      {
        q: "What flavours are available?",
        a: "The range includes Peri Peri, Pudina, Himalayan Salt and Lime Chilli — all roasted, not fried. New flavours are added periodically; check the product list above for what's currently in stock.",
      },
      {
        q: "Do you ship makhana across India?",
        a: "Yes — we do PAN India shipments. Order on letstryfoods.com.",
      },
    ],
  },
  'healthy-snacks': {
    title: "Healthy Indian Snacks Online – No Palm Oil, No Maida | Let's Try",
    description:
      "Shop healthy Indian snacks with no palm oil and no maida. Ragi, jowar, makhana, roasted chana, millet-based namkeen — shipped across India.",
    // Sprint 1c on-page content (user-approved 2026-04-25)
    tagline: "Healthy Indian snacks with no palm oil — roasted chana, sattu, makhana, kettle-cooked chips and more.",
    aboutHeading: "About our healthy snacks",
    about: [
      "Healthy snacking in India usually comes down to one question: what's the snack actually fried in? Most mass-market namkeen, chips and bhujia are fried in palm oil. Ours aren't.",
      "The healthy snacks range pulls together the lighter side of our catalog — roasted chana for protein, sattu for an energy-rich summer drink or as a flour ingredient, kettle-cooked potato wafers, and roasted makhana flavours. Some are roasted, not fried; the rest are made without palm oil.",
    ],
    faqs: [
      {
        q: "What makes these snacks \"healthy\"?",
        a: "Mainly that they're made without palm oil. Several products in the range — like roasted chana and roasted makhana — aren't fried at all. The line-up is also light on heavy fried namkeen and leans towards roasted, baked or kettle-cooked options.",
      },
      {
        q: "Are these suitable as office snacks?",
        a: "Yes. Products like roasted chana, makhana, kettle-cooked wafers and sattu have a long shelf life and travel well — they all work as desk-side snacks.",
      },
      {
        q: "Is everything in this range free of palm oil?",
        a: "Yes. None of the snacks in this range — or anywhere on Let's Try Foods — are made with palm oil.",
      },
      {
        q: "Do you ship across India?",
        a: "Yes — we do PAN India shipments. Order on letstryfoods.com.",
      },
    ],
  },
  'fasting-special': {
    title: "Vrat / Fasting Snacks – No Palm Oil, No Maida | Let's Try Foods",
    description:
      "Shop vrat / fasting snacks online. Sabudana, makhana, kuttu, singhara, vrat chips — no palm oil, no maida, Navratri-approved. From Let's Try Foods.",
    // Sprint 1c on-page content (user-approved 2026-04-25)
    tagline: "Vrat snacks, vrat chips and vrat namkeen — made with sendha namak, no palm oil.",
    aboutHeading: "About our vrat snacks",
    about: [
      "Most vrat-friendly chips and namkeen in the market are fried in palm oil and salted with regular table salt — both disqualifiers if you're observing a traditional fast. Our vrat range is made with rock salt (sendha namak) and contains no palm oil.",
      "The line-up covers the classics — vrat chips, sabudana mixture, vrat mota chips and other vrat namkeen — for Navratri, Sawan, Ekadashi or any day you're keeping it saatvik.",
    ],
    faqs: [
      {
        q: "Are these snacks Navratri / vrat-approved?",
        a: "Yes. The vrat range is made with rock salt (sendha namak) instead of regular salt, which is the traditional requirement for vrat / upvas eating.",
      },
      {
        q: "Do you use palm oil in the vrat range?",
        a: "No. None of our vrat snacks contain palm oil.",
      },
      {
        q: "What's in the range?",
        a: "Vrat chips, vrat mota chips, sabudana mixture and other vrat namkeen. Check the product list above for the full current selection.",
      },
      {
        q: "Do you ship vrat snacks across India?",
        a: "Yes — we do PAN India shipments. Order on letstryfoods.com.",
      },
    ],
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
    title: "Ragi Kaju Pista Cookies – No White Sugar | Let's Try Foods",
    description:
      "Healthy ragi cookies with kaju and pista — no palm oil, no white sugar, no maida. Millet-based biscuits from Let's Try Foods. Shipped across India.",
  },
  'lets-try-oats-coconut-cookies': {
    title: "Oats Coconut Cookies – No Palm Oil, No White Sugar | Let's Try",
    description:
      "Healthy oats and coconut cookies — no palm oil, no white sugar. Wholesome Indian biscuits from Let's Try Foods. Shipped across India.",
  },
  'lets-try-oats-choco-chip-cookies': {
    title: "Oats Choco Chip Cookies – No Palm Oil | Let's Try Foods",
    description:
      "Healthy oats choco chip cookies — no palm oil, no white sugar. Chocolate indulgence made better from Let's Try Foods. Shipped across India.",
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
