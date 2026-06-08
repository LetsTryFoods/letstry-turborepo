"use client";

import React, { useState, useEffect } from "react";
import { ProductGallery } from "./ProductGallery";
import { ProductTitle } from "./ProductTitle";
import { PriceBlock } from "./PriceBlock";
import { SizeSelector } from "./SizeSelector";
import { ActionButtons } from "./ActionButtons";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductTrustRow } from "./ProductTrustRow";
import { PincodeDeliveryEstimator } from "./PincodeDeliveryEstimator";
import { GetProductBySlugQuery } from "@/gql/graphql";
import { useAnalytics } from "@/hooks/use-analytics";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductDetailsProps {
  product: NonNullable<GetProductBySlugQuery["productBySlug"]>;
  breadcrumbItems?: BreadcrumbItem[];
  primaryCategorySlug?: string | null;
  occasions?: string[] | null;
  deliveryLeadTime?: string | null;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  breadcrumbItems,
  primaryCategorySlug,
  occasions,
  deliveryLeadTime,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.defaultVariant?._id || product.variants[0]?._id,
  );
  const { trackViewItem } = useAnalytics();

  const selectedVariant =
    product.variants.find((v) => v._id === selectedVariantId) ||
    product.defaultVariant ||
    product.variants[0];

  useEffect(() => {
    trackViewItem({
      id: selectedVariant?._id || product._id,
      name: product.name,
      price: selectedVariant?.price || 0,
      category: primaryCategorySlug || undefined,
      variant: selectedVariant?.name,
    });
  }, [
    selectedVariantId,
    product,
    selectedVariant,
    primaryCategorySlug,
    trackViewItem,
  ]);

  const images =
    selectedVariant?.images && selectedVariant.images.length > 0
      ? selectedVariant.images.map((img) => img.url)
      : product.defaultVariant?.images?.map((img) => img.url) || [];
  const displayImages = images.length > 0 ? images : ["/placeholder-image.svg"];

  const isOutOfStock = false; // Keep button enabled regardless of stock

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
      <div>
        <ProductGallery
          images={displayImages}
          isOutOfStock={isOutOfStock}
          productName={product.name}
        />
      </div>

      <div>
        <ProductTitle title={product.name} />
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <ProductBreadcrumb items={breadcrumbItems} />
        )}

        <div className="p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200 rounded-2xl sm:rounded-3xl">
          <PriceBlock
            price={selectedVariant?.price || 0}
            mrp={selectedVariant?.mrp || undefined}
          />

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
              variantName: selectedVariant?.name,
            }}
            isOutOfStock={isOutOfStock}
          />
        </div>

        <ProductTrustRow
          isVegetarian={product.isVegetarian}
          isGlutenFree={product.isGlutenFree}
          primaryCategorySlug={primaryCategorySlug}
          occasions={occasions}
        />
        <PincodeDeliveryEstimator deliveryLeadTime={deliveryLeadTime} />
      </div>
    </div>
  );
};
