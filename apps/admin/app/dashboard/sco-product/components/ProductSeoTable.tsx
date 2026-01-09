"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductSeoForm } from "./ProductSeoForm";
import { DeleteProductSeoDialog } from "./DeleteProductSeoDialog";
import { Product, ProductSeo, useUpdateProductSeo } from "@/lib/products/useProducts";
import { GenericSeoTable } from "@/components/seo/GenericSeoTable";
import { Image as ImageIcon } from "lucide-react";

interface ProductSeoTableProps {
  products: Product[];
  loading: boolean;
  onEditSeo: (product: Product) => void;
  onDeleteSeo: (product: Product) => void;
}

export function ProductSeoTable({
  products,
  loading,
  onEditSeo,
  onDeleteSeo
}: ProductSeoTableProps) {
  const columns = [
    {
      header: "Image",
      render: (p: Product) => (
        p?.variants?.[0]?.images?.[0]?.url ? (
          <img
            src={p.variants[0].images[0].url}
            alt={p.name}
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )
      ),
    },
    {
      header: "Product Name",
      render: (p: Product) => (
        <div className="flex flex-col">
          <span className="font-medium">{p.name}</span>
          {p.brand && <span className="text-xs text-muted-foreground">{p.brand}</span>}
        </div>
      ),
    },
    {
      header: "Slug",
      render: (p: Product) => <code className="px-2 py-1 bg-muted rounded text-xs">/{p.slug}</code>,
    },
  ];

  if (loading && products.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Loading products...</div>;
  }

  return (
    <GenericSeoTable
      items={products}
      columns={columns}
      hasSeo={(p) => !!(p.seo && p.seo.metaTitle)}
      getSeoTitle={(p) => p.seo?.metaTitle}
      getSeoDesc={(p) => p.seo?.metaDescription}
      onEdit={onEditSeo}
      onDelete={onDeleteSeo}
      rowKey={(p) => p._id}
    />
  );
}
