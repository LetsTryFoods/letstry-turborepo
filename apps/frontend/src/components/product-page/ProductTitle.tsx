import React from 'react';

interface ProductTitleProps {
  title: string;
}

export const ProductTitle: React.FC<ProductTitleProps> = ({ title }) => {
  return (
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
  );
};
