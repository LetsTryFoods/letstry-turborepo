import { MongoClient } from 'mongodb';

const URI = 'mongodb://admin:password@localhost:27017/letstry_dev?authSource=admin';
const DB   = 'letstry_dev';
const CDN  = 'https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev';

const pages = [
  // ─── no-palm-oil-snacks ───────────────────────────────────────────────────
  {
    slug: 'no-palm-oil-snacks',
    pageTitle: "No Palm Oil Snacks — Buy Healthy Indian Snacks Online | Let's Try Foods",
    description:
      "Most mass-market Indian snacks are fried in palm oil because it's cheap and extends shelf life. At Let's Try Foods we don't use palm oil in any of our namkeen, chips, cookies, makhana or south Indian snack ranges — we use 100% groundnut oil instead, and for products like roasted chana and roasted makhana we don't fry at all.\n\nShop our palm-oil-free Indian snacks below — shipped across India from Delhi.",
    tilesHeading: 'Shop No Palm Oil Snacks by Category',
    faqHeading: 'Frequently Asked Questions',
    tiles: [
      {
        name: 'Namkeens',
        blurb: 'Nimbu chatkara, teekha gathiya, khatta meetha — traditional Indian namkeen with no palm oil.',
        imageUrl: `${CDN}/44f70fa5794dd60f105a5e5d18679690.webp`,
        shopNowUrl: '/category/namkeens',
        position: 0,
      },
      {
        name: 'Flavoured Makhana',
        blurb: 'Lime & chilli, black salt, hot & spicy — roasted foxnuts, not fried. No palm oil.',
        imageUrl: `${CDN}/d1e0f1f1a709356e7ea4548a33ec0b07.webp`,
        shopNowUrl: '/category/makhana',
        position: 1,
      },
      {
        name: 'Chips & Wafers',
        blurb: 'Flying chilli, desi masala, cream & onion — crunchy chips with no palm oil.',
        imageUrl: `${CDN}/93c0dc542cea4ff3b9510825b988aa49.webp`,
        shopNowUrl: '/category/wafers',
        position: 2,
      },
      {
        name: 'No Maida Cookies',
        blurb: 'Atta jeera, oats & seeds, oats coconut — cookies with no palm oil and no white sugar.',
        imageUrl: `${CDN}/6573bdc013f1f0194047e47f5f17fd9a.webp`,
        shopNowUrl: '/category/no-maida-range',
        position: 3,
      },
      {
        name: 'South Range',
        blurb: 'Butter murukku, garlic ribbon murukku, pepper sticks — authentic South Indian snacks, no palm oil.',
        imageUrl: `${CDN}/7d56833f91dbb95cc69f809726f149ff.webp`,
        shopNowUrl: '/category/southrange',
        position: 4,
      },
      {
        name: 'Roasted Snacks',
        blurb: 'Roasted cashews, peanuts and seeds — wholesome snacks with zero frying oil.',
        imageUrl: `${CDN}/308d15ce1e0eab18fd708400aa8dbde3.webp`,
        shopNowUrl: '/category/roasted',
        position: 5,
      },
    ],
    faqs: [
      {
        question: 'What is palm oil and why avoid it in snacks?',
        answer: 'Palm oil is a cheap vegetable oil widely used in mass-market Indian snacks and namkeen because it extends shelf life and cuts cost. It is high in saturated fat and has been linked to health and environmental concerns. Many Indian shoppers now actively look for palm-oil-free snacks.',
        position: 0,
      },
      {
        question: "What oil does Let's Try Foods use instead of palm oil?",
        answer: "Let's Try Foods uses 100% groundnut oil across its namkeen, chips, cookies and south Indian snack ranges in place of palm oil. Products like roasted chana and roasted makhana use no frying oil at all.",
        position: 1,
      },
      {
        question: "Are all Let's Try snacks free of palm oil?",
        answer: "Yes — the Let's Try Foods brand positions every snack as palm-oil-free, including namkeen, chips, wafers, cookies, makhana and south Indian snacks. Check the ingredient label on each pack to confirm.",
        position: 2,
      },
      {
        question: "Which Let's Try snacks are also maida-free?",
        answer: "The makhana, no-maida cookies, roasted snacks and most of the namkeen range are made without maida. The south range (murukku, mathri) may contain rice flour — check individual products.",
        position: 3,
      },
      {
        question: "Do Let's Try Foods ship no-palm-oil snacks across India?",
        answer: "Yes. Let's Try Foods ships across India from Delhi. You can order any palm-oil-free snack on letstryfoods.com and have it delivered to your home.",
        position: 4,
      },
    ],
    seo: {
      metaTitle: "No Palm Oil Snacks – Healthy Indian Namkeen & Chips | Let's Try Foods",
      metaDescription: "Buy Indian snacks without palm oil — namkeen, chips, cookies, makhana and more. Let's Try Foods uses 100% groundnut oil. Shipped across India.",
      canonicalUrl: 'https://letstryfoods.com/category/no-palm-oil-snacks',
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ─── bhujia (demo for /category/bhujia) ──────────────────────────────────
  {
    slug: 'bhujia',
    pageTitle: 'Bhujia & Namkeen — Traditional Indian Snacks Without Palm Oil',
    description:
      'Our bhujia range is made with 100% groundnut oil, no palm oil, and no maida. From classic sev bhujia to garlic bhujia and khatta meetha — every pack is bursting with authentic flavour.\n\nAll bhujia and namkeen are oven-roasted or fried in groundnut oil in small batches from our Delhi kitchen.',
    tilesHeading: 'Explore Our Namkeen Range',
    faqHeading: 'Bhujia & Namkeen — FAQs',
    tiles: [
      {
        name: 'Sev Bhujia',
        blurb: 'Thin, crispy sev made with chickpea flour and groundnut oil.',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
        shopNowUrl: '/category/bhujia?type=sev',
        position: 0,
      },
      {
        name: 'Garlic Bhujia',
        blurb: 'Bold garlic flavour, crispy texture, zero palm oil.',
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
        shopNowUrl: '/category/bhujia?type=garlic',
        position: 1,
      },
      {
        name: 'Khatta Meetha',
        blurb: 'The perfect tangy-sweet mix of sev, peanuts and spices.',
        imageUrl: 'https://images.unsplash.com/photo-1606914469633-bd44f453c3f5?w=400&q=80',
        shopNowUrl: '/category/bhujia?type=khatta-meetha',
        position: 2,
      },
    ],
    faqs: [
      {
        question: 'Is the bhujia fried in palm oil?',
        answer: "No. All Let's Try bhujia and namkeen are fried in 100% groundnut oil. We never use palm oil, vanaspati or any hydrogenated fat.",
        position: 0,
      },
      {
        question: 'Does the bhujia contain maida?',
        answer: "Our bhujia is made primarily from besan (chickpea flour) and does not contain maida (refined wheat flour). It is also free from artificial colours and preservatives.",
        position: 1,
      },
      {
        question: 'How long does the bhujia stay fresh?',
        answer: 'Each pack has a shelf life of 3–6 months from the date of manufacture when stored in a cool, dry place. Check the best-before date printed on the pack.',
        position: 2,
      },
    ],
    seo: {
      metaTitle: "Bhujia & Namkeen Without Palm Oil | Let's Try Foods",
      metaDescription: "Shop traditional Indian bhujia and namkeen made with 100% groundnut oil — no palm oil, no maida. Sev bhujia, garlic bhujia, khatta meetha and more. Ships across India.",
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    const col = client.db(DB).collection('categorylandingpages');

    for (const page of pages) {
      const result = await col.updateOne(
        { slug: page.slug },
        { $set: page },
        { upsert: true },
      );
      const action = result.upsertedCount ? 'inserted' : 'updated';
      console.log(`✓ ${action}: /${page.slug}`);
    }

    console.log('\nDone! View your pages:');
    console.log('  http://localhost:3000/no-palm-oil-snacks');
    console.log('  http://localhost:3000/category/bhujia');
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
