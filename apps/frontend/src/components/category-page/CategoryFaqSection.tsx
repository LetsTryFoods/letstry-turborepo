import React from 'react';
import type { CategoryFaq } from '@/lib/seo/category-faqs';

interface CategoryFaqSectionProps {
  categoryName: string;
  faqs: CategoryFaq[];
}

// Server component — renders the visible FAQ block on category pages.
// The matching FAQPage JSON-LD is emitted by the page itself so Google /
// AI engines see one consistent set of Q&A in both DOM and structured data.
export const CategoryFaqSection: React.FC<CategoryFaqSectionProps> = ({
  categoryName,
  faqs,
}) => {
  if (!faqs.length) return null;

  return (
    <section
      aria-labelledby="category-faq-heading"
      className="mt-10 sm:mt-14 border-t border-gray-200 pt-8 sm:pt-10"
    >
      <h2
        id="category-faq-heading"
        className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6"
      >
        {categoryName} — Frequently Asked Questions
      </h2>
      <div className="space-y-5">
        {faqs.map((f) => (
          <div key={f.q} className="border-b border-gray-200 pb-5 last:border-b-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {f.q}
            </h3>
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
  );
};
