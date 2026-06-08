/**
 * One-time migration: seed the Pillar collection with the existing
 * `/no-palm-oil-snacks` content so the storefront page reads from CMS
 * (Pillar) instead of the legacy CategoryLandingPage flow.
 *
 * After Sprint 5b ships, run this once:
 *
 *   pnpm --filter backend tsx scripts/seed-no-palm-oil-pillar.ts
 *
 * Idempotent: if a pillar with customRoute='/no-palm-oil-snacks' already
 * exists, the script logs and exits without modifying anything. Safe to
 * re-run.
 *
 * The seeded content mirrors what the page renders today (intro paragraph,
 * 5 FAQs honouring the brand-claim matrix, 6 category tiles). The content
 * team can edit any of it via /dashboard/pillars after the seed.
 */

import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const PILLAR_COLLECTION = 'pillars';
const TARGET_SLUG = 'no-palm-oil-snacks';
const TARGET_CUSTOM_ROUTE = '/no-palm-oil-snacks';

const PILLAR_SEED = {
  slug: TARGET_SLUG,
  customRoute: TARGET_CUSTOM_ROUTE,
  title: 'No Palm Oil Snacks — Healthy Indian Namkeen Without Palm Oil',
  intro:
    "Most mass-market Indian snacks are fried in palm oil because it's cheap and extends shelf life. At Let's Try Foods we don't use palm oil in any of our bhujia, chips, cookies, makhana or rusk ranges — we use 100% groundnut oil instead, and for some products (like roasted chana and roasted makhana) we don't fry at all. Shop our palm-oil-free Indian snacks below — shipped across India from Delhi.",
  heroImageUrl: null,
  categoryTiles: [
    {
      categorySlug: 'bhujia',
      name: 'Bhujia & Namkeen',
      blurb:
        'Garlic bhujia, sev bhujia, khatta meetha — traditional Indian namkeen with no palm oil and no maida.',
    },
    {
      categorySlug: 'makhana',
      name: 'Flavoured Makhana',
      blurb:
        'Peri peri, pudina, Himalayan salt — roasted foxnuts, not fried. No palm oil.',
    },
    {
      categorySlug: 'cookies',
      name: 'Healthy Cookies',
      blurb:
        'Ragi, oats, jowar and millet cookies with no palm oil and no refined sugar.',
    },
    {
      categorySlug: 'healthy-snacks',
      name: 'Healthy Snacks',
      blurb:
        'Roasted chana, sattu, millet-based namkeen — wholesome Indian snacks without palm oil.',
    },
    {
      categorySlug: 'fasting-special',
      name: 'Vrat / Fasting',
      blurb:
        'Sabudana, makhana, vrat chips and kuttu snacks. No palm oil, no maida, Navratri-approved.',
    },
    {
      categorySlug: 'rusk',
      name: 'Cake Rusks',
      blurb: 'Classic, fruit and almond-kaju cake rusks made without palm oil.',
    },
  ],
  featuredProductIds: [],
  sections: [],
  faqs: [
    {
      question: 'What is palm oil and why avoid it in snacks?',
      answer:
        'Palm oil is a cheap vegetable oil widely used in mass-market Indian snacks and namkeen because it extends shelf life and cuts cost. It is high in saturated fat and has been linked to health and environmental concerns. Many Indian shoppers now actively look for palm-oil-free snacks.',
    },
    {
      question: "What oil does Let's Try Foods use instead of palm oil?",
      answer:
        "Let's Try Foods uses 100% groundnut oil across its namkeen, bhujia, chips and cookie ranges in place of palm oil. Products like roasted chana and roasted makhana use no frying oil at all.",
    },
    {
      question: "Are all Let's Try snacks free of palm oil?",
      answer:
        "Yes — the Let's Try Foods brand positions every snack as palm-oil-free, including bhujia, chips, wafers, cookies, makhana, rusk and fasting snacks. Check the ingredient label on each pack to confirm.",
    },
    {
      question: "Which Let's Try snacks are also maida-free?",
      answer:
        'The bhujia, makhana, healthy-snacks, cookies and most of the fasting-special range are made without maida. The Purani Delhi range (soan papdi, khari, mathri) and some cake rusks do contain refined wheat flour — check individual products.',
    },
    {
      question: "Do Let's Try Foods ship no-palm-oil snacks across India?",
      answer:
        "Yes. Let's Try Foods ships across India from Delhi. You can order any palm-oil-free snack on letstryfoods.com and have it delivered to your home.",
    },
  ],
  relatedPillarSlugs: [],
  isActive: true,
  position: 0,
  seo: {
    metaTitle:
      "No Palm Oil Snacks – Healthy Indian Namkeen & Chips | Let's Try Foods",
    metaDescription:
      "Buy Indian snacks without palm oil — bhujia, chips, cookies, makhana and more. Let's Try Foods uses 100% groundnut oil instead of palm oil. Shipped across India.",
    metaKeywords: [
      'no palm oil snacks',
      'palm oil free namkeen',
      'healthy indian snacks',
      'no maida snacks',
      'groundnut oil snacks',
    ],
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
      'Seeded by scripts/seed-no-palm-oil-pillar.ts during Sprint 5b. Mirrors the legacy /no-palm-oil-snacks page content. Content team can edit freely via /dashboard/pillars.',
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

  const pillars = db.collection(PILLAR_COLLECTION);

  // Idempotency: bail if a pillar already exists at this customRoute or slug.
  const existing = await pillars.findOne({
    $or: [{ customRoute: TARGET_CUSTOM_ROUTE }, { slug: TARGET_SLUG }],
  });

  if (existing) {
    console.log(
      `✓ Pillar already exists (slug=${existing.slug}, customRoute=${
        existing.customRoute ?? '(none)'
      }). No changes made.`,
    );
    await conn.disconnect();
    process.exit(0);
  }

  const now = new Date();
  const result = await pillars.insertOne({
    ...PILLAR_SEED,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`✓ Pillar seeded successfully.`);
  console.log(`  _id: ${result.insertedId}`);
  console.log(`  slug: ${TARGET_SLUG}`);
  console.log(`  customRoute: ${TARGET_CUSTOM_ROUTE}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Open the storefront: ${TARGET_CUSTOM_ROUTE}`);
  console.log(
    '     → page should now render from Pillar CMS (verify schema is intact)',
  );
  console.log('  2. Open admin → Pillars → "No Palm Oil Snacks" → Edit');
  console.log('     → confirm content matches what was on the page before');
  console.log(
    '  3. Make a small edit (e.g. tweak a typo) → verify it appears live',
  );

  await conn.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
