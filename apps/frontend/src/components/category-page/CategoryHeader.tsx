import React from 'react';

interface CategoryHeaderProps {
  title: string;
  productCount: number;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({ title, productCount }) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-black mb-2">{title}</h1>
      <p className="text-gray-600 text-lg">{productCount} products</p>
    </div>
  );
};
