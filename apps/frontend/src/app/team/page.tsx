import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamMembers, type Author } from '@/lib/author';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getCdnUrl } from '@/lib/image-utils';

export const revalidate = 1800;

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

export const metadata: Metadata = {
  title: { absolute: "Meet the team | Let's Try Foods" },
  description:
    "Meet the people behind Let's Try Foods — the founders and team building India's healthy snacks brand without palm oil.",
  alternates: { canonical: `${SITE_URL}/team` },
  openGraph: {
    title: "Meet the team | Let's Try Foods",
    description: "The people behind Let's Try Foods.",
    url: `${SITE_URL}/team`,
    type: 'website',
    siteName: "Let's Try Foods",
  },
};

export default async function TeamPage() {
  const members = await getTeamMembers();

  // Person schema for each team member -> strong E-E-A-T signal.
  const personSchemas = members.map((m) => buildPersonSchema(m));

  return (
    <>
      {personSchemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <main className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Breadcrumbs crumbs={[{ label: 'Home', href: '/' }, { label: 'Team' }]} />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet the team
          </h1>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-10 max-w-3xl">
            Let&apos;s Try Foods is built by a small team in Delhi who started this brand
            because they couldn&apos;t find Indian snacks made without palm oil for their
            own kids.
          </p>

          {members.length === 0 ? (
            <p className="text-gray-500">Team profiles will appear here once added in the admin panel.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((m) => (
                <TeamCard key={m._id} author={m} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function TeamCard({ author }: { author: Author }) {
  return (
    <Link
      href={`/author/${author.slug}`}
      className="block rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition"
    >
      {author.photoUrl ? (
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-4">
          <Image src={getCdnUrl(author.photoUrl)} alt={author.name} fill sizes="96px" className="object-cover" />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" aria-hidden />
      )}
      <h2 className="text-lg font-semibold text-gray-900">{author.name}</h2>
      {author.jobTitle && <p className="text-sm text-gray-600">{author.jobTitle}</p>}
      {author.expertise.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">{author.expertise.slice(0, 3).join(' · ')}</p>
      )}
    </Link>
  );
}

function buildPersonSchema(author: Author) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/author/${author.slug}#person`,
    name: author.name,
    jobTitle: author.jobTitle || undefined,
    description: author.bio || undefined,
    image: author.photoUrl ? getCdnUrl(author.photoUrl) : undefined,
    email: author.publicEmail || undefined,
    knowsAbout: author.expertise.length > 0 ? author.expertise : undefined,
    hasCredential: author.credentials.length > 0 ? author.credentials : undefined,
    sameAs: author.socialLinks.map((l) => l.url),
    worksFor: { '@id': `${SITE_URL}#organization` },
    url: `${SITE_URL}/author/${author.slug}`,
  };
}
