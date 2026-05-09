'use client';

import React, { useEffect, useRef } from 'react';
import { ProductCard, Product } from './ProductCard';
import { useAnalytics } from '@/hooks/use-analytics';

interface ProductGridProps {
  products: Product[];
  categoryType?: 'default' | 'special';
  slug?: string;
  listId?: string;
  listName?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categoryType,
  slug,
  listId,
  listName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { trackViewItemList } = useAnalytics();
  const hasFiredRef = useRef(false);

  const resolvedListId = listId || (slug ? `category_${slug}` : 'product_grid');
  const resolvedListName = listName || (slug ? `Category: ${slug}` : 'Product Grid');

  useEffect(() => {
    const el = containerRef.current;
    if (!el || products.length === 0 || hasFiredRef.current) return;

    const guardKey = `vil_fired:${resolvedListId}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(guardKey)) {
      hasFiredRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || hasFiredRef.current) return;

        hasFiredRef.current = true;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(guardKey, '1');
        }

        trackViewItemList(
          products.map((p, index) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            position: index,
          })),
          resolvedListName,
        );

        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [products, resolvedListId, resolvedListName, trackViewItemList]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4  gap-4 sm:gap-6 md:gap-8 lg:gap-10"
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryType={categoryType}
          slug={slug}
          listId={resolvedListId}
          listName={resolvedListName}
          position={index}
        />
      ))}
    </div>
  );
};
