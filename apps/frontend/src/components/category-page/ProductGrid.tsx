import React from 'react';
import { ProductCard, Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  categoryType?: 'default' | 'special';
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, categoryType }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} categoryType={categoryType} />
      ))}
    </div>
  );
};
