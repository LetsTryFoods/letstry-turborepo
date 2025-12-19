'use client';

import React, { useState } from 'react';
import { ProductGallery } from './ProductGallery';
import { ProductTitle } from './ProductTitle';
import { CategoryLink } from './CategoryLink';
import { PriceBlock } from './PriceBlock';
import { SizeSelector } from './SizeSelector';
import { ActionButtons } from './ActionButtons';
import { GetProductBySlugQuery } from '@/gql/graphql';

interface ProductDetailsProps {
  product: NonNullable<GetProductBySlugQuery['productBySlug']>;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedVariantId, setSelectedVariantId] = useState(product.defaultVariant?._id || product.variants[0]?._id);

  const selectedVariant = product.variants.find(v => v._id === selectedVariantId) || product.defaultVariant || product.variants[0];

  const images = (selectedVariant?.images && selectedVariant.images.length > 0) 
    ? selectedVariant.images.map(img => img.url) 
    : (product.defaultVariant?.images?.map(img => img.url) || []);
  const displayImages = images.length > 0 ? images : ['/placeholder-image.svg'];

  const isOutOfStock = selectedVariant?.stockQuantity === 0 || selectedVariant?.availabilityStatus !== 'in_stock';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <ProductGallery 
          images={displayImages} 
          isOutOfStock={isOutOfStock}
        />
      </div>

      <div>
        <ProductTitle title={product.name} />
        
        {product.category && (
          <CategoryLink 
            categoryName={product.category.name} 
            iconUrl={product.category.imageUrl || undefined} 
          />
        )}
        
        <div className="p-6 border border-gray-200 rounded-3xl">
           <PriceBlock price={selectedVariant?.price || 0} mrp={selectedVariant?.mrp || undefined} />
           
           <SizeSelector 
             variants={product.availableVariants || []}
             selectedVariantId={selectedVariantId}
             onSelect={setSelectedVariantId}
           />
           
           <ActionButtons 
             product={{
               id: selectedVariant?._id || product._id,
               name: product.name,
               price: selectedVariant?.price || 0,
               variantName: selectedVariant?.name
             }}
             isOutOfStock={isOutOfStock}
           />
        </div>
      </div>
    </div>
  );
};
