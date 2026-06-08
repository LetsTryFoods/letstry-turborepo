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

export const ProductDetailFAQ = ({
  faqs,
  heading = "Frequently Asked Questions",
}: ProductDetailFAQProps) => {
  const [sectionOpen, setSectionOpen] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

    const toggle = (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
    };

    return (
      <div
        id="product-faq"
        aria-labelledby="product-faq-heading"
        className="border border-gray-200 rounded-lg overflow-hidden mt-4 sm:mt-6 md:mt-2 lg:mt-4 xl:mt-6"
      >
        <button
          onClick={() => setSectionOpen(!sectionOpen)}
          className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 bg-white hover:bg-gray-50 transition-colors"
        >
          <span
            id="product-faq-heading"
            className="text-base sm:text-lg font-bold text-gray-900"
          >
            {heading}
          </span>
          {sectionOpen ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
          )}
        </button>

        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            sectionOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {faqs.map((faq, index) => (
            <div key={faq.q} className="border-t border-gray-200">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm sm:text-base font-semibold text-gray-900 pr-4">
                  {faq.q}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-500" />
                )}
              </button>

              <div
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  openIndex === index
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0",
                )}
              >
                <p
                  data-speakable="true"
                  className="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 text-sm sm:text-base text-gray-600 leading-relaxed"
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
