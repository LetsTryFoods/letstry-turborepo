"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/category-page/ProductGrid";
import type { Product } from "@/components/category-page/ProductCard";
import { useSaleProducts } from "@/lib/landing-sale/use-sale-products";
import type { SaleProductItem, SaleProductsMeta } from "@/lib/landing-sale/get-sale-data";

function mapSaleProduct(apiProduct: SaleProductItem): Product {
  return {
    id: apiProduct._id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    image: apiProduct.defaultVariant?.thumbnailUrl || "",
    price: apiProduct.defaultVariant?.price || 0,
    mrp: apiProduct.defaultVariant?.mrp,
    variants: (apiProduct.variants || []).map((v) => ({
      id: v._id,
      weight: v.packageSize || "",
      price: v.price,
      mrp: v.mrp,
      isOutOfStock: v.availabilityStatus !== "in_stock",
    })),
    badge: { label: "🔥 SALE", variant: "trending" as const },
  };
}

interface SaleProductGridProps {
  /** First page of products pre-fetched on the server — shown instantly, no spinner */
  initialItems?: SaleProductItem[];
  initialMeta?: SaleProductsMeta;
}

export function SaleProductGrid({ initialItems, initialMeta }: SaleProductGridProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSaleProducts({ initialItems, initialMeta });
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Only show the spinner if there are NO initial products at all
  if (isLoading && (!initialItems || initialItems.length === 0)) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  const products =
    data?.pages.flatMap(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (page) => (page?.saleProductsPaginated?.items as any[])?.map(mapSaleProduct) ?? [],
    ) ?? (initialItems?.map(mapSaleProduct) ?? []);

  const totalCount =
    data?.pages[data.pages.length - 1]?.saleProductsPaginated?.meta
      ?.totalCount ?? initialMeta?.totalCount ?? 0;

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ fontSize: 20, color: "#6b7280", fontWeight: 600 }}>
          No sale items right now. Check back soon!
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: 20,
            background: "#dc2626",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            padding: "12px 28px",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Shop All Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>
          All Sale Items
        </h2>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {totalCount} product{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      <ProductGrid
        products={products}
        listId="landing_sale_products"
        listName="Landing Sale"
      />

      <div ref={loaderRef} className="py-6 flex justify-center">
        {isFetchingNextPage && (
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
        )}
      </div>
    </>
  );
}
