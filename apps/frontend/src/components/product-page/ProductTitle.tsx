import React from "react";

interface ProductTitleProps {
  title: string;
}

export const ProductTitle: React.FC<ProductTitleProps> = ({ title }) => {
  return (
    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
      {title}
    </h1>
  );
};
