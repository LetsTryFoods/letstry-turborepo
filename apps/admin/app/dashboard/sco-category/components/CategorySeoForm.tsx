"use client";

import { GenericSeoForm } from "@/components/seo/GenericSeoForm";
import { Category } from "@/lib/categories/useCategories";
import { SeoFormData } from "@/lib/validations/seo.schema";

interface CategorySeoFormProps {
  category: Category;
  existingSeo?: any | null;
  isLoading: boolean;
  onSubmit: (data: SeoFormData) => Promise<void>;
  onCancel: () => void;
}

export function CategorySeoForm({
  category,
  existingSeo,
  isLoading,
  onSubmit,
  onCancel,
}: CategorySeoFormProps) {
  return (
    <GenericSeoForm
      initialData={existingSeo}
      entityName={category.name}
      entitySlug={category.slug}
      entityType="Category"
      entityImageUrl={category.imageUrl || ""}
      onSubmit={onSubmit}
      isLoading={isLoading}
      onCancel={onCancel}
    />
  );
}
