import React from "react";

/**
 * On-page content sections that render below the category product grid.
 *
 * Both components are server-safe (no hooks, no client state). They render
 * `null` when no content is provided so categories without a Sprint 1c
 * override stay visually identical to the old layout.
 *
 * Content is sourced from `lib/seo/overrides.ts` — see `SeoOverride.about`
 * and `SeoOverride.faqs`.
 */

interface CategoryAboutProps {
  /** Section heading. Defaults to "About this category". */
  heading?: string;
  /** Paragraphs to render. One <p> per array entry. */
  paragraphs?: string[];
}

export const CategoryAbout: React.FC<CategoryAboutProps> = ({
  heading,
  paragraphs,
}) => {
  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <section
      aria-labelledby="category-about-heading"
      className="mt-10 sm:mt-14 md:mt-16 max-w-3xl"
    >
      <h2
        id="category-about-heading"
        className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-3 sm:mb-4"
      >
        {heading || "About this category"}
      </h2>
      {paragraphs.map((p, idx) => (
        <p
          key={idx}
          className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4 last:mb-0"
        >
          {p}
        </p>
      ))}
    </section>
  );
};

export interface CategoryFaq {
  q: string;
  a: string;
}

interface CategoryFAQProps {
  faqs?: CategoryFaq[];
}

export const CategoryFAQ: React.FC<CategoryFAQProps> = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      aria-labelledby="category-faq-heading"
      className="mt-10 sm:mt-14 md:mt-16 max-w-3xl"
    >
      <h2
        id="category-faq-heading"
        className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6"
      >
        Frequently Asked Questions
      </h2>
      <div className="space-y-4 sm:space-y-5">
        {faqs.map((faq) => (
          <div
            key={faq.q}
            className="border-b border-gray-200 pb-4 sm:pb-5 last:border-b-0"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {faq.q}
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
