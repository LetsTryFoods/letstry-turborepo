import React from "react";

interface CategoryAnswerBoxProps {
  intro: string;
}

// Short, quote-able intro paragraph rendered above the product grid.
// AI answer engines (ChatGPT Search, Perplexity, Google AI Overviews) tend to
// extract the first concise paragraph after an H1 — keeping this 40–60 words
// and free of marketing fluff is deliberate.
//
// data-speakable="true" hints to voice / AI engines that this paragraph is a
// good candidate for spoken answers. The matching Speakable schema is emitted
// from the page-level JSON-LD using the [data-speakable="true"] CSS selector.
export const CategoryAnswerBox: React.FC<CategoryAnswerBoxProps> = ({
  intro,
}) => {
  return (
    <p
      data-speakable="true"
      className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-4xl mt-2 mb-6"
    >
      {intro}
    </p>
  );
};
