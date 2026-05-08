/**
 * Seed the "no-palm-oil-snacks" category landing page via the admin GraphQL API.
 *
 * Usage (local):
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret node seed-no-palm-oil-snacks.mjs
 *
 * Usage (production):
 *   API_URL=https://api.letstryfoods.com/graphql \
 *   ADMIN_EMAIL=admin@letstryfoods.com \
 *   ADMIN_PASSWORD=yourpassword \
 *   node seed-no-palm-oil-snacks.mjs
 */

const API_URL      = process.env.API_URL       || 'http://localhost:5001/graphql';
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL   || '';
const ADMIN_PASS   = process.env.ADMIN_PASSWORD || '';

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error('❌  Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
  process.exit(1);
}

// ─── Page data ────────────────────────────────────────────────────────────────

const CDN = 'https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev';

const PAGE = {
  slug: 'no-palm-oil-snacks',
  pageTitle: "No Palm Oil Snacks — Buy Healthy Indian Snacks Online | Let's Try Foods",
  description:
    "Most mass-market Indian snacks are fried in palm oil because it's cheap and extends shelf life. At Let's Try Foods we don't use palm oil in any of our namkeen, chips, cookies, makhana or south Indian snack ranges — we use 100% groundnut oil instead, and for products like roasted chana and roasted makhana we don't fry at all.\n\nShop our palm-oil-free Indian snacks below — shipped across India from Delhi.",
  tilesHeading: 'Shop No Palm Oil Snacks by Category',
  faqHeading: 'Frequently Asked Questions',
  isActive: true,
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
      answer:
        'Palm oil is a cheap vegetable oil widely used in mass-market Indian snacks and namkeen because it extends shelf life and cuts cost. It is high in saturated fat and has been linked to health and environmental concerns. Many Indian shoppers now actively look for palm-oil-free snacks.',
      position: 0,
    },
    {
      question: "What oil does Let's Try Foods use instead of palm oil?",
      answer:
        "Let's Try Foods uses 100% groundnut oil across its namkeen, bhujia, chips and cookie ranges in place of palm oil. Products like roasted chana and roasted makhana use no frying oil at all.",
      position: 1,
    },
    {
      question: "Are all Let's Try snacks free of palm oil?",
      answer:
        "Yes — the Let's Try Foods brand positions every snack as palm-oil-free, including bhujia, chips, wafers, cookies, makhana, rusk and fasting snacks. Check the ingredient label on each pack to confirm.",
      position: 2,
    },
    {
      question: "Which Let's Try snacks are also maida-free?",
      answer:
        "The bhujia, makhana, healthy-snacks, cookies and most of the fasting-special range are made without maida. The Purani Delhi range (soan papdi, khari, mathri) and some cake rusks do contain refined wheat flour — check individual products.",
      position: 3,
    },
    {
      question: "Do Let's Try Foods ship no-palm-oil snacks across India?",
      answer:
        "Yes. Let's Try Foods ships across India from Delhi. You can order any palm-oil-free snack on letstryfoods.com and have it delivered to your home.",
      position: 4,
    },
  ],
  seo: {
    metaTitle: "No Palm Oil Snacks – Healthy Indian Namkeen & Chips | Let's Try Foods",
    metaDescription:
      "Buy Indian snacks without palm oil — bhujia, chips, cookies, makhana and more. Let's Try Foods doesn't use palm oil in any of its snacks. Shipped across India.",
    canonicalUrl: 'https://letstryfoods.com/category/no-palm-oil-snacks',
  },
};

// ─── GraphQL helpers ──────────────────────────────────────────────────────────

async function gql(query, variables, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

// ─── Mutations / queries ──────────────────────────────────────────────────────

const LOGIN = `
  mutation AdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password)
  }
`;

const LIST = `
  query {
    categoryLandingPages {
      _id
      slug
    }
  }
`;

const CREATE = `
  mutation CreateCategoryLandingPage($input: CreateCategoryLandingPageInput!) {
    createCategoryLandingPage(input: $input) {
      _id
      slug
    }
  }
`;

const UPDATE = `
  mutation UpdateCategoryLandingPage($id: String!, $input: UpdateCategoryLandingPageInput!) {
    updateCategoryLandingPage(id: $id, input: $input) {
      _id
      slug
    }
  }
`;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n→ API: ${API_URL}`);

  // 1. Login
  console.log('→ Logging in...');
  const { adminLogin: token } = await gql(LOGIN, { email: ADMIN_EMAIL, password: ADMIN_PASS });
  console.log('✓ Authenticated');

  // 2. Check if page already exists
  const { categoryLandingPages: pages } = await gql(LIST, {}, token);
  const existing = pages.find((p) => p.slug === PAGE.slug);

  if (existing) {
    // 3a. Update
    console.log(`→ Found existing page (${existing._id}), updating...`);
    const { updateCategoryLandingPage: updated } = await gql(
      UPDATE,
      { id: existing._id, input: PAGE },
      token,
    );
    console.log(`✓ Updated: /${updated.slug} (${updated._id})`);
  } else {
    // 3b. Create
    console.log('→ No existing page found, creating...');
    const { createCategoryLandingPage: created } = await gql(CREATE, { input: PAGE }, token);
    console.log(`✓ Created: /${created.slug} (${created._id})`);
  }

  console.log('\n✅  Done — page is live at /category/no-palm-oil-snacks\n');
}

run().catch((err) => {
  console.error('\n❌  Error:', err.message);
  process.exit(1);
});
