import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getActivePressMentions } from "@/lib/press-mention";
import { getCdnUrl } from "@/lib/image-utils";

export const revalidate = 1800;

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");
const PAGE_URL = `${SITE_URL}/press`;

export const metadata: Metadata = {
  title: { absolute: "Press kit | Let's Try Foods" },
  description:
    "Press resources for Let's Try Foods — brand assets, founder bio, key facts, media coverage and contact information for journalists and bloggers covering healthy Indian snacks.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Press kit | Let's Try Foods",
    description:
      "Brand assets, key facts, media coverage and contact for journalists.",
    url: PAGE_URL,
    type: "website",
    siteName: "Let's Try Foods",
  },
};

const FAST_FACTS = [
  ["Brand", "Let's Try Foods"],
  ["Legal entity", "Earth Crust Pvt Ltd"],
  ["Founded", "2021"],
  ["Headquartered", "Delhi, India"],
  ["Sector", "D2C Indian healthy snacks"],
  ["Universal claim", "No palm oil — across every product"],
  [
    "Cooking oil used",
    "100% groundnut oil (frying); roasted ranges use no frying oil",
  ],
  [
    "No-maida ranges",
    "Bhujia, makhana, healthy-snacks, cookies, most fasting-special",
  ],
  ["No-refined-sugar", "Cookies range only"],
  [
    "Distribution",
    "Direct-to-consumer across India + bulk / corporate / export",
  ],
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function PressPage() {
  const mentions = await getActivePressMentions();

  // NewsArticle schema for each press mention. The brand is the entity being
  // covered (mentions.about → Organization), the publication is the publisher,
  // and the article URL is the canonical reference.
  const newsArticleSchemas = mentions.map((m) => ({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${PAGE_URL}#mention-${m.slug}`,
    headline: m.headline,
    url: m.url,
    datePublished: m.publishedAt,
    description: m.excerpt || undefined,
    image: m.coverImageUrl ? getCdnUrl(m.coverImageUrl) : undefined,
    publisher: {
      "@type": "Organization",
      name: m.publication,
      logo: m.publicationLogoUrl
        ? {
            "@type": "ImageObject",
            url: getCdnUrl(m.publicationLogoUrl),
          }
        : undefined,
    },
    about: { "@id": `${SITE_URL}#organization` },
    mentions: { "@id": `${SITE_URL}#organization` },
  }));

  // Wrapper CollectionPage so engines see the press kit page itself, not just
  // a loose list of articles.
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#collection`,
    url: PAGE_URL,
    name: "Press kit | Let's Try Foods",
    description:
      "Press resources for Let's Try Foods — brand assets, key facts, media coverage and contact for journalists.",
    inLanguage: "en-IN",
    isPartOf: { "@id": `${SITE_URL}#website` },
    about: { "@id": `${SITE_URL}#organization` },
    ...(mentions.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: mentions.length,
            itemListElement: mentions.map((m, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              item: { "@id": `${PAGE_URL}#mention-${m.slug}` },
            })),
          },
        }
      : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Press", item: PAGE_URL },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {newsArticleSchemas.map((schema) => (
        <script
          key={schema["@id"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Breadcrumbs
          crumbs={[{ label: "Home", href: "/" }, { label: "Press" }]}
        />

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Press kit
        </h1>
        <p
          data-speakable="true"
          className="text-base sm:text-lg text-gray-700 leading-relaxed mb-10"
        >
          Let&apos;s Try Foods is a Delhi-based D2C healthy-snacks brand founded
          in 2021. Every product is made without palm oil; most are also made
          without maida, and the cookies range is made without refined sugar.
        </p>

        {mentions.length > 0 && (
          <section className="mb-10" aria-labelledby="coverage-heading">
            <h2
              id="coverage-heading"
              className="text-2xl font-semibold text-gray-900 mb-4"
            >
              Recent coverage
            </h2>
            <ul className="space-y-5">
              {mentions.map((m) => (
                <li
                  key={m._id}
                  className="border-b border-gray-200 pb-5 last:border-b-0"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {m.publicationLogoUrl && (
                      <Image
                        src={getCdnUrl(m.publicationLogoUrl)}
                        alt={`${m.publication} logo`}
                        width={32}
                        height={32}
                        className="rounded-sm object-contain bg-gray-50"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {m.publication}
                    </span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(m.publishedAt)}
                    </span>
                    {m.category && (
                      <>
                        <span className="text-xs text-gray-500">·</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {m.category}
                        </span>
                      </>
                    )}
                  </div>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block text-base sm:text-lg font-semibold text-gray-900 hover:text-[#0C5273]"
                  >
                    {m.headline}
                  </a>
                  {m.excerpt && (
                    <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                      {m.excerpt}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-10" aria-labelledby="facts-heading">
          <h2
            id="facts-heading"
            className="text-2xl font-semibold text-gray-900 mb-4"
          >
            Fast facts
          </h2>
          <dl className="space-y-2">
            {FAST_FACTS.map(([k, v]) => (
              <div key={k} className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="font-medium text-gray-900 w-48 flex-shrink-0">
                  {k}
                </dt>
                <dd className="text-gray-700">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-10" aria-labelledby="contact-heading">
          <h2
            id="contact-heading"
            className="text-2xl font-semibold text-gray-900 mb-4"
          >
            Press contact
          </h2>
          <p className="text-gray-700">
            For interviews, samples or product imagery, email{" "}
            <Link
              href="mailto:corporate@letstryfoods.com"
              className="text-[#0C5273] underline"
            >
              corporate@letstryfoods.com
            </Link>
            .
          </p>
        </section>

        <section className="mb-10" aria-labelledby="brand-heading">
          <h2
            id="brand-heading"
            className="text-2xl font-semibold text-gray-900 mb-4"
          >
            Brand assets
          </h2>
          <p className="text-gray-700">
            Logo and product imagery are available on request. Please credit{" "}
            &ldquo;Let&apos;s Try Foods&rdquo; when used.
          </p>
        </section>

        <section className="mb-10" aria-labelledby="story-heading">
          <h2
            id="story-heading"
            className="text-2xl font-semibold text-gray-900 mb-4"
          >
            The story
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s Try Foods began in 2021 in Delhi. The founders found that
            almost every mass-market Indian snack was fried in palm oil and made
            with maida. They started the brand to bring back traditional Indian
            snacks — bhujia, namkeen, cookies, makhana, rusk and Purani Delhi
            favourites — using 100% groundnut oil and millet flours instead.
            Today the brand ships across India and supplies bulk / corporate /
            export buyers from its Delhi facility.
          </p>
        </section>
      </div>
    </main>
  );
}
