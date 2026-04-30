import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAuthorBySlug } from '@/lib/author';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getCdnUrl } from '@/lib/image-utils';

export const revalidate = 1800;

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: 'Author not found' };

  const url = `${SITE_URL}/author/${author.slug}`;
  const title = `${author.name}${author.jobTitle ? ` — ${author.jobTitle}` : ''} | Let's Try Foods`;
  const description =
    author.bio?.slice(0, 200) ||
    `Read articles by ${author.name} on the Let's Try Foods blog.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      siteName: "Let's Try Foods",
      images: author.photoUrl ? [{ url: getCdnUrl(author.photoUrl) }] : [],
    },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author || !author.isActive) notFound();

  const url = `${SITE_URL}/author/${author.slug}`;

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${url}#person`,
    name: author.name,
    jobTitle: author.jobTitle || undefined,
    description: author.bio || undefined,
    image: author.photoUrl ? getCdnUrl(author.photoUrl) : undefined,
    email: author.publicEmail || undefined,
    knowsAbout: author.expertise.length > 0 ? author.expertise : undefined,
    hasCredential: author.credentials.length > 0 ? author.credentials : undefined,
    sameAs: author.socialLinks.map((l) => l.url),
    worksFor: { '@id': `${SITE_URL}#organization` },
    url,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Team', item: `${SITE_URL}/team` },
      { '@type': 'ListItem', position: 3, name: author.name, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Team', href: '/team' },
              { label: author.name },
            ]}
          />

          <header className="flex flex-col sm:flex-row gap-6 mb-10 items-start">
            {author.photoUrl && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={getCdnUrl(author.photoUrl)} alt={author.name} fill sizes="128px" className="object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
              {author.jobTitle && <p className="text-base text-gray-600 mt-1">{author.jobTitle}</p>}
              {author.isFounder && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-900 border border-amber-200">
                  Founder
                </span>
              )}
            </div>
          </header>

          {author.bio && (
            <section className="prose prose-lg max-w-none mb-8" data-speakable="true"
              dangerouslySetInnerHTML={{ __html: author.bio }}
            />
          )}

          {author.expertise.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Areas of expertise</h2>
              <ul className="flex flex-wrap gap-2">
                {author.expertise.map((e) => (
                  <li key={e} className="px-3 py-1 rounded-full bg-gray-50 text-sm border border-gray-200">{e}</li>
                ))}
              </ul>
            </section>
          )}

          {author.credentials.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Credentials</h2>
              <ul className="list-disc pl-6 text-gray-700">
                {author.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}

          {author.socialLinks.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Find me on</h2>
              <ul className="flex flex-wrap gap-3">
                {author.socialLinks.map((l) => (
                  <li key={l.url}>
                    <Link
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="text-[#0C5273] underline"
                    >
                      {l.platform}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
