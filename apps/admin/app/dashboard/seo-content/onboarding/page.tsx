/**
 * Onboarding doc shown to the content team. Linked from the SEO checklist
 * panel and from the sidebar. Designed to be readable by a non-technical
 * content writer hired by the SEO owner.
 */

export default function OnboardingPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto prose prose-sm">
      <h1>Content team onboarding — Let&apos;s Try Foods SEO</h1>
      <p>
        Welcome. This guide explains how the storefront uses every field
        in the admin so you can publish SEO-clean pages with confidence.
      </p>

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
        <a href="/dashboard/pillars">Pillars admin</a> — no developer
        needed. Set <em>active</em> to true when ready to publish.
      </p>

      <h2>Authors / team</h2>
      <p>
        Populate the <a href="/dashboard/authors">Authors admin</a> with
        real Person profiles for the founder and any blog authors. Each
        profile drives <code>/team</code>, <code>/author/&lt;slug&gt;</code>{' '}
        and Person schema linked from blog posts. Named-author authority
        is one of the strongest E-E-A-T signals for food / health
        content.
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
