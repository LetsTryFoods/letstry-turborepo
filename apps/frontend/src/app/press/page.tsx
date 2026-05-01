import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: { absolute: "Press kit | Let's Try Foods" },
  description:
    "Press resources for Let's Try Foods — brand assets, founder bio, key facts and contact information for journalists and bloggers covering healthy Indian snacks.",
  alternates: { canonical: `${SITE_URL}/press` },
  openGraph: {
    title: "Press kit | Let's Try Foods",
    description: "Brand assets, key facts and contact for media coverage.",
    url: `${SITE_URL}/press`,
    type: 'website',
    siteName: "Let's Try Foods",
  },
};

const FAST_FACTS = [
  ['Brand', "Let's Try Foods"],
  ['Legal entity', 'Earth Crust Pvt Ltd'],
  ['Founded', '2021'],
  ['Headquartered', 'Delhi, India'],
  ['Sector', 'D2C Indian healthy snacks'],
  ['Universal claim', 'No palm oil — across every product'],
  ['Cooking oil used', '100% groundnut oil (frying); roasted ranges use no frying oil'],
  ['No-maida ranges', 'Bhujia, makhana, healthy-snacks, cookies, most fasting-special'],
  ['No-refined-sugar', 'Cookies range only'],
  ['Distribution', 'Direct-to-consumer across India + bulk / corporate / export'],
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Breadcrumbs crumbs={[{ label: 'Home', href: '/' }, { label: 'Press' }]} />

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Press kit</h1>
        <p data-speakable="true" className="text-base sm:text-lg text-gray-700 leading-relaxed mb-10">
          Let&apos;s Try Foods is a Delhi-based D2C healthy-snacks brand founded in 2021.
          Every product is made without palm oil; most are also made without maida,
          and the cookies range is made without refined sugar.
        </p>

        <section className="mb-10" aria-labelledby="facts-heading">
          <h2 id="facts-heading" className="text-2xl font-semibold text-gray-900 mb-4">Fast facts</h2>
          <dl className="space-y-2">
            {FAST_FACTS.map(([k, v]) => (
              <div key={k} className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="font-medium text-gray-900 w-48 flex-shrink-0">{k}</dt>
                <dd className="text-gray-700">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-10" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-2xl font-semibold text-gray-900 mb-4">Press contact</h2>
          <p className="text-gray-700">
            For interviews, samples or product imagery, email{' '}
            <Link href="mailto:corporate@letstryfoods.com" className="text-[#0C5273] underline">
              corporate@letstryfoods.com
            </Link>
            .
          </p>
        </section>

        <section className="mb-10" aria-labelledby="brand-heading">
          <h2 id="brand-heading" className="text-2xl font-semibold text-gray-900 mb-4">Brand assets</h2>
          <p className="text-gray-700">
            Logo and product imagery are available on request. Please credit{' '}
            &ldquo;Let&apos;s Try Foods&rdquo; when used.
          </p>
        </section>

        <section className="mb-10" aria-labelledby="story-heading">
          <h2 id="story-heading" className="text-2xl font-semibold text-gray-900 mb-4">The story</h2>
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s Try Foods began in 2021 in Delhi. The founders found that almost every
            mass-market Indian snack was fried in palm oil and made with maida. They
            started the brand to bring back traditional Indian snacks — bhujia,
            namkeen, cookies, makhana, rusk and Purani Delhi favourites — using 100%
            groundnut oil and millet flours instead. Today the brand ships across
            India and supplies bulk / corporate / export buyers from its Delhi
            facility.
          </p>
        </section>
      </div>
    </main>
  );
}
