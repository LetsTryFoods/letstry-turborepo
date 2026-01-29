import React from 'react';
import { ProductCard, Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  categoryType?: 'default' | 'special';
  slug?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, categoryType, slug }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4  gap-4 sm:gap-6 md:gap-8 lg:gap-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} categoryType={categoryType} slug={slug} />
      ))}
    </div>
  );
};
