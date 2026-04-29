import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

const PAGE_TITLE = "No Palm Oil Snacks – Healthy Indian Namkeen & Chips | Let's Try Foods";
const PAGE_DESCRIPTION =
  "Buy Indian snacks without palm oil — bhujia, chips, cookies, makhana and more. Let's Try Foods uses 100% groundnut oil instead of palm oil. Shipped across India.";
const PAGE_URL = `${SITE_URL}/no-palm-oil-snacks`;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    siteName: "Let's Try Foods",
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const CATEGORY_TILES = [
  {
    slug: 'bhujia',
    name: 'Bhujia & Namkeen',
    blurb: 'Garlic bhujia, sev bhujia, khatta meetha — traditional Indian namkeen with no palm oil and no maida.',
  },
  {
    slug: 'makhana',
    name: 'Flavoured Makhana',
    blurb: 'Peri peri, pudina, Himalayan salt — roasted foxnuts, not fried. No palm oil.',
  },
  {
    slug: 'cookies',
    name: 'Healthy Cookies',
    blurb: 'Ragi, oats, jowar and millet cookies with no palm oil and no refined sugar.',
  },
  {
    slug: 'healthy-snacks',
    name: 'Healthy Snacks',
    blurb: 'Roasted chana, sattu, millet-based namkeen — wholesome Indian snacks without palm oil.',
  },
  {
    slug: 'fasting-special',
    name: 'Vrat / Fasting',
    blurb: 'Sabudana, makhana, vrat chips and kuttu snacks. No palm oil, no maida, Navratri-approved.',
  },
  {
    slug: 'rusk',
    name: 'Cake Rusks',
    blurb: 'Classic, fruit and almond-kaju cake rusks made without palm oil.',
  },
] as const;

const FAQS = [
  {
    q: 'What is palm oil and why avoid it in snacks?',
    a: 'Palm oil is a cheap vegetable oil widely used in mass-market Indian snacks and namkeen because it extends shelf life and cuts cost. It is high in saturated fat and has been linked to health and environmental concerns. Many Indian shoppers now actively look for palm-oil-free snacks.',
  },
  {
    q: 'What oil does Let\'s Try Foods use instead of palm oil?',
    a: 'Let\'s Try Foods uses 100% groundnut oil across its namkeen, bhujia, chips and cookie ranges in place of palm oil. Products like roasted chana and roasted makhana use no frying oil at all.',
  },
  {
    q: 'Are all Let\'s Try snacks free of palm oil?',
    a: 'Yes — the Let\'s Try Foods brand positions every snack as palm-oil-free, including bhujia, chips, wafers, cookies, makhana, rusk and fasting snacks. Check the ingredient label on each pack to confirm.',
  },
  {
    q: 'Which Let\'s Try snacks are also maida-free?',
    a: 'The bhujia, makhana, healthy-snacks, cookies and most of the fasting-special range are made without maida. The Purani Delhi range (soan papdi, khari, mathri) and some cake rusks do contain refined wheat flour — check individual products.',
  },
  {
    q: 'Do Let\'s Try Foods ship no-palm-oil snacks across India?',
    a: 'Yes. Let\'s Try Foods ships across India from Delhi. You can order any palm-oil-free snack on letstryfoods.com and have it delivered to your home.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'No Palm Oil Snacks', item: PAGE_URL },
  ],
};

// Speakable schema flags the intro paragraph and FAQ answers as good
// candidates for AI / voice answer engines to quote verbatim.
const speakableSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${PAGE_URL}#speakable`,
  url: PAGE_URL,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['[data-speakable="true"]'],
  },
};

export default function NoPalmOilSnacksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      <main className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-800">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">No Palm Oil Snacks</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            No Palm Oil Snacks — Healthy Indian Namkeen Without Palm Oil
          </h1>

          <p
            data-speakable="true"
            className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4"
          >
            Most mass-market Indian snacks are fried in palm oil because it&apos;s cheap
            and extends shelf life. At Let&apos;s Try Foods we don&apos;t use palm oil in any
            of our bhujia, chips, cookies, makhana or rusk ranges — we use 100%
            groundnut oil instead, and for some products (like roasted chana and
            roasted makhana) we don&apos;t fry at all.
          </p>

          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-10">
            Shop our palm-oil-free Indian snacks below — shipped across India from
            Delhi.
          </p>

          <section aria-labelledby="categories-heading" className="mb-14">
            <h2 id="categories-heading" className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Shop No Palm Oil Snacks by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {CATEGORY_TILES.map((tile) => (
                <Link
                  key={tile.slug}
                  href={`/${tile.slug}`}
                  className="block rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tile.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{tile.blurb}</p>
                  <span className="inline-block mt-3 text-sm font-medium text-[#0C5273]">Shop {tile.name} →</span>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="faq-heading" className="mb-8">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {FAQS.map((f) => (
                <div key={f.q} className="border-b border-gray-200 pb-5">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{f.q}</h3>
                  <p
                    data-speakable="true"
                    className="text-sm sm:text-base text-gray-700 leading-relaxed"
                  >
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
