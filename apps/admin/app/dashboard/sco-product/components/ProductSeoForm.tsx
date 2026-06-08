"use client";

import { toast } from "react-hot-toast";
import { GenericSeoForm } from "@/components/seo/GenericSeoForm";
import { LiveProductSeoPreview } from "@/components/seo/LiveProductSeoPreview";
import {
  Product,
  ProductSeo,
  useUpdateProductSeo,
} from "@/lib/products/useProducts";
import { SeoFormData } from "@/lib/validations/seo.schema";

interface ProductSeoFormProps {
  product: Product;
  existingSeo?: ProductSeo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductSeoForm({
  product,
  existingSeo,
  onSuccess,
  onCancel,
}: ProductSeoFormProps) {
  const { updateProductSeo, loading: isLoading } = useUpdateProductSeo();

  const handleSubmit = async (data: SeoFormData) => {
    try {
      await updateProductSeo(product._id, {
        ...data,
        metaKeywords: data.metaKeywords || [],
      });
      toast.success(`SEO saved for "${product.name}"`);
      onSuccess();
    } catch (error) {
      console.error("Failed to save product SEO:", error);
      toast.error(`Save failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-4">
      <LiveProductSeoPreview
        product={{
          name: product.name,
          slug: product.slug,
          description:
            (product as Product & { description?: string | null })
              .description ?? null,
          isVegetarian:
            (product as Product & { isVegetarian?: boolean | null })
              .isVegetarian ?? null,
          shelfLife:
            (product as Product & { shelfLife?: string | null }).shelfLife ??
            null,
          variants: product.variants?.map((v) => ({
            packageSize: v.packageSize ?? null,
            weight: v.weight ?? null,
            weightUnit: v.weightUnit ?? null,
            isDefault: v.isDefault ?? null,
          })),
        }}
        cms={
          existingSeo
            ? {
                metaTitle: existingSeo.metaTitle,
                metaDescription: existingSeo.metaDescription,
              }
            : null
        }
      />
      <GenericSeoForm
        initialData={existingSeo as any}
        entityName={product.name}
        entitySlug={product.slug}
        entityType="Product"
        entityImageUrl={product?.variants?.[0]?.images?.[0]?.url || ""}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onCancel}
      />
    </div>
  );
}
