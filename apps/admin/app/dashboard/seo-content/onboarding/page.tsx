/**
 * Onboarding doc + content-backlog dashboard for the content team.
 *
 * Top of the page = "Content Backlog" — live counts of authors, pillars,
 * press mentions etc. so the team can see what's missing at a glance with
 * one-click links to fix each gap.
 *
 * Below = the brand-matrix and field-by-field reference (unchanged) so the
 * team has the rules within reach while populating.
 */
'use client';

import Link from 'next/link';
import { useAuthors } from '@/lib/authors/useAuthors';
import { usePillars } from '@/lib/pillars/usePillars';
import { usePressMentions } from '@/lib/press-mentions/usePressMentions';

interface BacklogRow {
  label: string;
  count: number | null;
  target?: string;
  hint: string;
  fixHref: string;
  fixLabel: string;
  status: 'ok' | 'warn' | 'fail' | 'unknown';
}

function rowStatus(count: number | null, target = 1): BacklogRow['status'] {
  if (count === null) return 'unknown';
  if (count === 0) return 'fail';
  if (count < target) return 'warn';
  return 'ok';
}

function StatusBadge({ status }: { status: BacklogRow['status'] }) {
  const styles: Record<BacklogRow['status'], string> = {
    ok: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warn: 'bg-amber-100 text-amber-700 border-amber-200',
    fail: 'bg-red-100 text-red-700 border-red-200',
    unknown: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const label: Record<BacklogRow['status'], string> = {
    ok: 'OK',
    warn: 'Below target',
    fail: 'Empty',
    unknown: '—',
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

function ContentBacklog() {
  const { data: authorsData, loading: authorsLoading } = useAuthors();
  const { data: pillarsData, loading: pillarsLoading } = usePillars();
  const { data: pressData, loading: pressLoading } = usePressMentions();

  const authorsCount = authorsLoading
    ? null
    : ((authorsData as { authors?: unknown[] } | undefined)?.authors?.length ?? 0);
  const pillarsCount = pillarsLoading
    ? null
    : ((pillarsData as { pillars?: unknown[] } | undefined)?.pillars?.length ?? 0);
  const pressCount = pressLoading
    ? null
    : ((pressData as { pressMentions?: unknown[] } | undefined)?.pressMentions?.length ?? 0);

  const rows: BacklogRow[] = [
    {
      label: 'Authors',
      count: authorsCount,
      target: 'at least 1 (founder)',
      hint:
        'Drives /team, /author/<slug>, blog bylines and Person schema. Start with a founder bio + photo.',
      fixHref: '/dashboard/authors',
      fixLabel: 'Manage authors',
      status: rowStatus(authorsCount, 1),
    },
    {
      label: 'Pillars',
      count: pillarsCount,
      target: '3–6 keyword clusters',
      hint:
        'Each pillar is a /p/<slug> SEO hub page. Plan: no-palm-oil-snacks, palm-oil-free-namkeen, no-maida-snacks, no-refined-sugar-cookies, healthy-vrat-snacks, healthy-snacks-for-kids.',
      fixHref: '/dashboard/pillars',
      fixLabel: 'Manage pillars',
      status: rowStatus(pillarsCount, 3),
    },
    {
      label: 'Press mentions',
      count: pressCount,
      target: 'as many as you have',
      hint:
        'Drives the /press page and NewsArticle schema. Add every legitimate piece of media coverage — even small blogs count for E-E-A-T.',
      fixHref: '/dashboard/press-mentions',
      fixLabel: 'Manage press mentions',
      status: rowStatus(pressCount, 1),
    },
    {
      label: 'Reviews',
      count: null,
      hint:
        '⚠️ Reviews admin is currently using dummy data — backend module needs to be built before approve/reject does anything real. Tracked as Sprint 6.',
      fixHref: '/dashboard/reviews',
      fixLabel: 'View admin (read-only)',
      status: 'unknown',
    },
    {
      label: 'Product SEO',
      count: null,
      hint:
        'Per-product meta title / description / OG / canonical / keywords. Each top-traffic product should have all SEO fields filled.',
      fixHref: '/dashboard/sco-product',
      fixLabel: 'Manage Product SEO',
      status: 'unknown',
    },
    {
      label: 'Category SEO',
      count: null,
      hint:
        'Per-category meta title / description / OG. Each category page should have all SEO fields filled.',
      fixHref: '/dashboard/sco-category',
      fixLabel: 'Manage Category SEO',
      status: 'unknown',
    },
    {
      label: 'Category Pages (CMS-driven enrichment)',
      count: null,
      hint:
        'Long-form intro, FAQs and tiles that enrich /bhujia, /cookies, etc. Different from Category SEO — this is on-page content, not metadata.',
      fixHref: '/dashboard/category-landing-pages',
      fixLabel: 'Manage Category Pages',
      status: 'unknown',
    },
  ];

  return (
    <div className="not-prose mb-10 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 m-0">
          Content backlog
        </h2>
        <p className="text-xs text-gray-600 mt-0.5">
          Live status of the SEO / AEO content the storefront is waiting for.
          Click any row to start filling it in.
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 sm:flex-1">
              <StatusBadge status={row.status} />
              <span className="font-medium text-sm text-gray-900">{row.label}</span>
              <span className="text-xs text-gray-500 tabular-nums">
                {row.count === null ? '—' : `${row.count}`}
                {row.target && row.count !== null && (
                  <span className="text-gray-400"> / {row.target}</span>
                )}
              </span>
            </div>
            <p className="text-xs text-gray-600 sm:flex-1">{row.hint}</p>
            <Link
              href={row.fixHref}
              className="text-xs font-medium text-[#0C5273] hover:underline whitespace-nowrap"
            >
              {row.fixLabel} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto prose prose-sm">
      <h1>Content team onboarding — Let&apos;s Try Foods SEO</h1>
      <p>
        Welcome. The dashboard below shows what content the storefront is
        waiting for. The reference section that follows explains how each
        field on the storefront uses what you publish.
      </p>

      <ContentBacklog />

      <h2>Brand-claim matrix (read this first — non-negotiable)</h2>
      <ul>
        <li>
          <strong>No palm oil</strong> applies to <em>every</em> product.
          Always say so on every page.
        </li>
        <li>
          <strong>No maida</strong> applies to: bhujia, makhana,
          healthy-snacks, cookies, most fasting-special. It does{' '}
          <strong>NOT</strong> apply to the Purani Delhi range or cake
          rusks. Never claim &ldquo;no maida&rdquo; on those products or
          their categories.
        </li>
        <li>
          <strong>No refined sugar</strong> applies <em>only</em> to the
          cookies range.
        </li>
        <li>
          The cooking oil used in place of palm oil is{' '}
          <strong>100% groundnut oil</strong>. Never substitute &ldquo;sunflower
          oil&rdquo; or any other oil — that&apos;s a fabricated claim.
        </li>
      </ul>
      <p>
        If unsure, leave the claim out. Honest disclosure (e.g. listing
        &ldquo;contains maida&rdquo; in the cons array for rusk) earns trust.
      </p>

      <h2>How the storefront uses each field</h2>

      <h3>Product → Long description</h3>
      <p>
        Renders below the gallery as the &ldquo;About this product&rdquo;
        section. Aim for 300–800 words per product. The first paragraph
        is automatically marked <code>data-speakable</code>, which means
        AI engines (ChatGPT, Perplexity, Google AI Overviews) will quote
        it directly. So write the first paragraph as a 40–60 word
        standalone answer to &ldquo;what is this product?&rdquo;.
      </p>

      <h3>Product → Health benefits</h3>
      <p>
        Renders as a green-bordered &ldquo;Health benefits&rdquo; box. Use
        bullet points. Stick to factual benefits supported by ingredients
        (e.g. &ldquo;ragi is naturally high in calcium&rdquo;) — don&apos;t
        make medical claims.
      </p>

      <h3>Product → Serving suggestions / Storage / Origin / Manufacturing</h3>
      <p>Each renders as its own section. Empty sections are hidden gracefully.</p>

      <h3>Product → Audience tags</h3>
      <p>
        Suggested values:{' '}
        <code>kids</code>, <code>fitness</code>, <code>vrat-observers</code>,{' '}
        <code>diabetics</code>, <code>gifting</code>, <code>corporate-gifting</code>,{' '}
        <code>family-snacking</code>. These tags <em>unlock</em>
        conversational FAQs (e.g. tagging &ldquo;kids&rdquo; auto-generates the
        &ldquo;Can my child eat this?&rdquo; FAQ).
      </p>

      <h3>Product → Occasions</h3>
      <p>
        Suggested values:{' '}
        <code>diwali</code>, <code>rakhi</code>, <code>holi</code>,{' '}
        <code>navratri</code>, <code>tea-time</code>,{' '}
        <code>post-workout</code>. Tagging a product with{' '}
        <code>navratri</code> auto-generates the vrat-suitability FAQ.
      </p>

      <h3>Product → Pros / Cons</h3>
      <p>
        Pros are short positive claims (3–5 items). Cons are honest
        disclosures — for the rusk range, set cons to include &ldquo;Contains
        maida&rdquo;. Both arrays drive Google&apos;s pros/cons rich
        result.
      </p>

      <h3>Product → Pillar slugs</h3>
      <p>
        Link the product to the relevant pillar pages (e.g.{' '}
        <code>no-palm-oil-snacks</code>, <code>no-maida-snacks</code>).
        This drives the breadcrumb chain (Home &gt; Pillar &gt; Category
        &gt; Product) and makes the product appear in pillar feature
        sections.
      </p>

      <h3>Product → CMS FAQs</h3>
      <p>
        These supplement the auto-generated FAQs. If both have the same
        question text (case-insensitive match), your CMS FAQ wins. Aim for
        3–5 hand-authored FAQs per product, written as 40–60 word direct
        answers (AI engines quote whole answers verbatim).
      </p>

      <h3>Product → Nutrition</h3>
      <p>
        Powers the visible nutrition table on the PDP and Schema.org{' '}
        <code>NutritionInformation</code> rich result. Use values from the
        actual product label.
      </p>

      <h3>Product → Lifestyle images</h3>
      <p>
        Separate from variant pack-shots. Add 3–5 lifestyle / usage
        photos. Every image needs descriptive alt text (e.g. &ldquo;Garlic
        Bhujia served on a brass plate beside masala chai&rdquo;) — alt
        text drives image-search rankings and accessibility.
      </p>

      <h3>SEO panel (every page)</h3>
      <ul>
        <li>
          <strong>Meta title</strong> — 50–60 characters. Must include the
          most important USP keyword (&ldquo;No Palm Oil&rdquo;) and the
          product name. Example:{' '}
          <code>Garlic Bhujia 200g – No Palm Oil, No Maida | Let&apos;s Try Foods</code>
        </li>
        <li>
          <strong>Meta description</strong> — 140–160 characters. Write it
          as a sales pitch with the brand-claim USP. Example:{' '}
          <code>
            Buy Garlic Bhujia (200g) made without palm oil and without
            maida. 100% groundnut oil. Shipped across India from Delhi.
          </code>
        </li>
        <li>
          <strong>Canonical URL</strong> — leave blank unless you want to
          point a duplicate URL to the master.
        </li>
        <li>
          <strong>OG image</strong> — set a lifestyle shot (not the pack
          shot). This is what shows on WhatsApp / Twitter / Facebook
          shares.
        </li>
      </ul>

      <h2>Pillar pages</h2>
      <p>
        Pillar pages (<code>/p/&lt;slug&gt;</code>) are the entry points
        for non-branded keyword clusters. Today the brand has one pillar
        live (<code>/no-palm-oil-snacks</code>); the plan is to add{' '}
        <code>/p/palm-oil-free-namkeen</code>,{' '}
        <code>/p/no-maida-snacks</code>,{' '}
        <code>/p/no-refined-sugar-cookies</code>,{' '}
        <code>/p/healthy-vrat-snacks</code>,{' '}
        <code>/p/healthy-snacks-for-kids</code>.
      </p>
      <p>
        Each pillar needs:
      </p>
      <ul>
        <li>A 40–60 word intro paragraph (this gets quoted by AI engines).</li>
        <li>3–6 category tiles linking to relevant category pages.</li>
        <li>4–8 long-form sections (problem framing, comparison, education).</li>
        <li>5–8 FAQs.</li>
      </ul>
      <p>
        Pillars launch by simply creating a new entry in the{' '}
        <Link href="/dashboard/pillars">Pillars admin</Link> — no developer
        needed. Set <em>active</em> to true when ready to publish.
      </p>

      <h2>Authors / team</h2>
      <p>
        Populate the <Link href="/dashboard/authors">Authors admin</Link> with
        real Person profiles for the founder and any blog authors. Each
        profile drives <code>/team</code>, <code>/author/&lt;slug&gt;</code>{' '}
        and Person schema linked from blog posts. Named-author authority
        is one of the strongest E-E-A-T signals for food / health
        content.
      </p>

      <h2>Press mentions</h2>
      <p>
        The <Link href="/dashboard/press-mentions">Press Mentions admin</Link>{' '}
        powers the <code>/press</code> page and emits NewsArticle JSON-LD for
        every entry. Add every legitimate piece of media coverage — even small
        blogs help E-E-A-T. Each entry needs a publication name, headline, URL,
        published date, and ideally a short excerpt.
      </p>

      <h2>What NOT to do</h2>
      <ul>
        <li>
          Never invent ingredient specifics that aren&apos;t on the actual
          product label.
        </li>
        <li>
          Never claim &ldquo;no maida&rdquo; on Purani Delhi or rusk products
          — they contain maida.
        </li>
        <li>
          Never claim &ldquo;no refined sugar&rdquo; outside the cookies range.
        </li>
        <li>Never paste copyrighted content from competitor sites.</li>
        <li>
          Never share customer data, PII, or financial info in any
          field.
        </li>
      </ul>

      <h2>Pre-publish checklist</h2>
      <p>
        On every product / pillar / blog edit page, the SEO readiness
        panel on the right side scores the page out of 100. Aim for{' '}
        <strong>80+</strong> before publishing. Click each red /
        amber row to read the hint.
      </p>
    </div>
  );
}
