import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getPillarBySlug } from '@/lib/pillar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getCdnUrl } from '@/lib/image-utils';

export const revalidate = 1800;

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pillar = await getPillarBySlug(slug);
  if (!pillar) return { title: 'Pillar not found' };

  const url = `${SITE_URL}/p/${pillar.slug}`;
  const title = pillar.seo?.metaTitle || `${pillar.title} | Let's Try Foods`;
  const description = pillar.seo?.metaDescription || pillar.intro;
  return {
    title: { absolute: title },
    description,
    keywords: pillar.seo?.metaKeywords || [],
    alternates: { canonical: pillar.seo?.canonicalUrl || url },
    openGraph: {
      title: pillar.seo?.ogTitle || title,
      description: pillar.seo?.ogDescription || description,
      url,
      type: 'website',
      siteName: "Let's Try Foods",
      images: pillar.seo?.ogImage
        ? [{ url: getCdnUrl(pillar.seo.ogImage) }]
        : pillar.heroImageUrl
          ? [{ url: getCdnUrl(pillar.heroImageUrl) }]
          : [],
    },
    twitter: {
      card: (pillar.seo?.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: pillar.seo?.twitterTitle || title,
      description: pillar.seo?.twitterDescription || description,
      images: pillar.seo?.twitterImage ? [getCdnUrl(pillar.seo.twitterImage)] : undefined,
    },
    robots: pillar.seo?.robots || undefined,
  };
}

export default async function PillarPage({ params }: PageProps) {
  const { slug } = await params;
  const pillar = await getPillarBySlug(slug);
  if (!pillar || !pillar.isActive) notFound();

  const url = `${SITE_URL}/p/${pillar.slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: pillar.title, item: url },
    ],
  };

  const faqSchema = pillar.faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: pillar.faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }
    : null;

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#speakable`,
    url,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      <main className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Breadcrumbs crumbs={[{ label: 'Home', href: '/' }, { label: pillar.title }]} />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {pillar.title}
          </h1>
          <p data-speakable="true" className="text-base sm:text-lg text-gray-700 leading-relaxed mb-10">
            {pillar.intro}
          </p>

          {pillar.heroImageUrl && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-gray-100">
              <Image src={getCdnUrl(pillar.heroImageUrl)} alt={pillar.title} fill priority sizes="(max-width: 1024px) 100vw, 1024px" />
            </div>
          )}

          {pillar.categoryTiles.length > 0 && (
            <section aria-labelledby="categories-heading" className="mb-14">
              <h2 id="categories-heading" className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
                Shop by category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {pillar.categoryTiles.map((t) => (
                  <Link
                    key={t.categorySlug}
                    href={`/${t.categorySlug}`}
                    className="block rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t.blurb}</p>
                    <span className="inline-block mt-3 text-sm font-medium text-[#0C5273]">Shop {t.name} →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {pillar.sections.map((s, i) => (
            <section key={i} aria-labelledby={`section-${i}`} className="mb-12">
              <h2 id={`section-${i}`} className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                {s.heading}
              </h2>
              <div
                {...(s.speakable ? { 'data-speakable': 'true' } : {})}
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: s.body }}
              />
            </section>
          ))}

          {pillar.faqs.length > 0 && (
            <section aria-labelledby="faq-heading" className="mb-8">
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6">
                Frequently asked questions
              </h2>
              <div className="space-y-5">
                {pillar.faqs.map((f, i) => (
                  <div key={i} className="border-b border-gray-200 pb-5 last:border-b-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{f.question}</h3>
                    <p data-speakable="true" className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {f.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pillar.relatedPillarSlugs.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-12 pt-10 border-t border-gray-200">
              <h2 id="related-heading" className="text-xl font-semibold text-gray-900 mb-4">
                Related pillars
              </h2>
              <div className="flex flex-wrap gap-3">
                {pillar.relatedPillarSlugs.map((s) => (
                  <Link
                    key={s}
                    href={`/p/${s}`}
                    className="px-4 py-2 rounded-full border border-gray-200 hover:border-gray-400 text-sm text-gray-800"
                  >
                    {s.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
