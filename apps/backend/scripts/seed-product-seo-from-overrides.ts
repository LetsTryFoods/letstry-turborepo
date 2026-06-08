/**
 * One-time migration: backfill the ProductSeo collection with the
 * hand-written overrides from `apps/frontend/src/lib/seo/overrides.ts`
 * (productOverrides map).
 *
 * Why: the storefront resolves product page metadata as
 *   1. CMS ProductSeo (admin-editable)
 *   2. Hardcoded override (overrides.ts) — for ~20 top-traffic products
 *   3. Auto-generated default
 *
 * That fallback chain confused editors: opening admin → Product SEO for
 * "Garlic Bhujia" showed empty fields, but the live page rendered a real
 * title because the override at step 2 was kicking in. Edits in admin
 * appeared to do nothing because the override kept winning until a CMS
 * value was saved.
 *
 * After this script runs, every product that previously relied on a
 * hardcoded override has a real ProductSeo entry with the same content.
 * The admin panel becomes the single source of truth — what editors see
 * in admin matches what's live.
 *
 * Run once after deploy:
 *   pnpm --filter backend seed:product-seo-overrides
 *
 * Idempotent: skips products that already have any non-empty
 * `metaTitle` in their ProductSeo document. Safe to re-run.
 */

import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

interface SeoOverride {
  title: string;
  description: string;
}

// Mirrored from apps/frontend/src/lib/seo/overrides.ts. Keep in sync.
const productOverrides: Record<string, SeoOverride> = {
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
  sattu: {
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

async function seed() {
  const uri = process.env.DATABASE_URL;
  const dbName = process.env.DATABASE_NAME || 'letstry_dev';

  if (!uri) {
    console.error('DATABASE_URL is not defined in .env or environment');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB: ${dbName}…`);
  const conn = await mongoose.connect(uri, { dbName });
  const db = conn.connection.db;
  if (!db) {
    throw new Error('Database object is not available after connection');
  }

  const products = db.collection('products');
  const productSeos = db.collection('productseos');

  let createdCount = 0;
  let updatedCount = 0;
  let skippedExisting = 0;
  let skippedMissing = 0;

  for (const [slug, override] of Object.entries(productOverrides)) {
    const product = await products.findOne({ slug });
    if (!product) {
      console.warn(`  ✗ Product slug "${slug}" not found in DB — skipping`);
      skippedMissing++;
      continue;
    }

    const productId = product._id.toString();
    const existing = await productSeos.findOne({ productId });

    const now = new Date();

    if (existing) {
      // If existing has metaTitle already (i.e., editor has saved
      // something), don't overwrite — they win.
      if (existing.metaTitle && existing.metaTitle.trim().length > 0) {
        console.log(
          `  - "${slug}" already has CMS metaTitle ("${existing.metaTitle.slice(0, 60)}…") — skipping`,
        );
        skippedExisting++;
        continue;
      }
      // Existing doc but empty fields — update with override values.
      await productSeos.updateOne(
        { productId },
        {
          $set: {
            metaTitle: override.title,
            metaDescription: override.description,
            updatedAt: now,
          },
        },
      );
      console.log(`  ✓ Updated empty SEO for "${slug}" with override`);
      updatedCount++;
    } else {
      // No SEO doc yet — create one with override.
      await productSeos.insertOne({
        productId,
        metaTitle: override.title,
        metaDescription: override.description,
        metaKeywords: [],
        canonicalUrl: null,
        ogTitle: null,
        ogDescription: null,
        ogImage: null,
        twitterCard: 'summary_large_image',
        twitterTitle: null,
        twitterDescription: null,
        twitterImage: null,
        robots: null,
        internalNote:
          'Seeded by scripts/seed-product-seo-from-overrides.ts on ' +
          now.toISOString().slice(0, 10) +
          '. Original source: lib/seo/overrides.ts. Editor may freely edit.',
        createdAt: now,
        updatedAt: now,
      });
      console.log(`  ✓ Created SEO for "${slug}"`);
      createdCount++;
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`  Created:               ${createdCount}`);
  console.log(`  Updated empty docs:    ${updatedCount}`);
  console.log(`  Skipped (CMS-edited):  ${skippedExisting}`);
  console.log(`  Skipped (missing):     ${skippedMissing}`);
  console.log('');
  console.log(
    'After this runs, the storefront will read the seeded values from CMS',
  );
  console.log(
    'instead of falling back to lib/seo/overrides.ts. Editors can now',
  );
  console.log(
    'edit these in admin → Product SEO and their changes will land live.',
  );

  await conn.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
