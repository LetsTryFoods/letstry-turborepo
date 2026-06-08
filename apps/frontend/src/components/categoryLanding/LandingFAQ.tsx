"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

type LandingFAQProps = {
  heading: string;
  faqs: FAQItem[];
  sectionId?: string;
};

export const LandingFAQ = ({
  heading,
  faqs,
  sectionId = "faq",
}: LandingFAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id={sectionId} className="bg-white">
      <div className="container mx-auto">
        {heading && (
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12 ">
            {heading}
          </h2>
        )}

        <div className="space-y-3 md:space-y-4  ">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl mt-4 border border-gray-200 border-red-500 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-5 py-4 md:px-6 md:py-5 text-left cursor-pointer"
              >
                <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <span
                  className="flex-shrink-0 transition-transform duration-300"
                  style={{
                    transform:
                      openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown className="w-5 h-5 text-[#0C5273]" />
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: openIndex === index ? "500px" : "0px" }}
              >
                <div className="px-5 pb-4 md:px-6 md:pb-5">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
