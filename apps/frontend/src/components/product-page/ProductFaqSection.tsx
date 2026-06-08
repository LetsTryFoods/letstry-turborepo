"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

interface ProductFaqSectionProps {
  faqs: FaqItem[];
}

export function ProductFaqSection({ faqs }: ProductFaqSectionProps) {
  const [sectionOpen, setSectionOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12">
      <button
        onClick={() => setSectionOpen(!sectionOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={sectionOpen}
      >
        <span className="text-base sm:text-lg font-bold text-gray-900">
          Frequently Asked Questions
        </span>
        {sectionOpen ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
        )}
      </button>

      <div
        className={cn(
          "transition-all duration-500 ease-in-out overflow-hidden",
          sectionOpen ? "max-h-[6000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-5 md:pb-5 lg:px-6 lg:pb-6 space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-4 text-left cursor-pointer"
                aria-expanded={openIndex === index}
              >
                <span className="text-sm sm:text-base font-semibold text-gray-900 pr-4">
                  {faq.q}
                </span>
                <span className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-4 h-4 text-[#0C5273]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#0C5273]" />
                  )}
                </span>
              </button>

              <div
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  openIndex === index
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0",
                )}
              >
                <div className="px-4 pb-3 md:px-5 md:pb-4">
                  <p
                    data-speakable="true"
                    className="text-sm sm:text-base text-gray-600 leading-relaxed"
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
