"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type FAQItem = {
  q: string;
  a: string;
};

type ProductDetailFAQProps = {
  faqs: FAQItem[];
  heading?: string;
};

const CategoryFaqSection = ({
  faqs,
  heading = "Frequently Asked Questions",
}: ProductDetailFAQProps) => {
  const [sectionOpen, setSectionOpen] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="product-faq"
      aria-labelledby="product-faq-heading"
      className="mt-8 sm:mt-10 md:mt-12"
    >
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setSectionOpen(!sectionOpen)}
          className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-6 md:px-8"
          aria-expanded={sectionOpen}
        >
          <h2
            id="product-faq-heading"
            className="text-lg font-bold text-gray-900 sm:text-xl"
          >
            {heading}
          </h2>
          {sectionOpen ? (
            <ChevronUp className="size-5 shrink-0 text-gray-900" />
          ) : (
            <ChevronDown className="size-5 shrink-0 text-gray-600" />
          )}
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            sectionOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.q} className="border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleQuestion(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6 md:px-8"
                  aria-expanded={isOpen}
                >
                  <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-gray-500 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p
                    data-speakable="true"
                    className="px-5 pb-5 text-sm leading-relaxed text-gray-600 sm:px-6 sm:text-base md:px-8"
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFaqSection;