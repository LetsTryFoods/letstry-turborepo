import { z } from "zod";

// Variant schema for each product variant
export const variantFormSchema = z
  .object({
    _id: z.string().optional(),
    sku: z.string().min(1, "SKU is required"),
    name: z.string().min(1, "Variant name is required"),
    price: z.coerce
      .number()
      .min(0, "Price cannot be negative")
      .positive("Price must be greater than 0"),
    mrp: z.coerce
      .number()
      .min(0, "MRP cannot be negative")
      .positive("MRP must be greater than 0"),
    discountPercent: z.coerce
      .number()
      .min(0, "Discount cannot be negative")
      .max(100, "Discount cannot exceed 100%")
      .default(0),
    discountSource: z.string().default("product"),
    weight: z.coerce
      .number()
      .min(0, "Weight cannot be negative")
      .positive("Weight must be greater than 0"),
    weightUnit: z.string().default("g"),
    packageSize: z.string().min(1, "Package size is required"),
    length: z.coerce
      .number()
      .min(0, "Length cannot be negative")
      .positive("Length must be greater than 0"),
    height: z.coerce
      .number()
      .min(0, "Height cannot be negative")
      .positive("Height must be greater than 0"),
    breadth: z.coerce
      .number()
      .min(0, "Breadth cannot be negative")
      .positive("Breadth must be greater than 0"),
    stockQuantity: z.coerce
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative")
      .default(0),
    availabilityStatus: z.string().default("in_stock"),
    images: z
      .array(
        z.object({
          file: z.any().optional(),
          alt: z.string(),
          preview: z.string(),
          url: z.string().optional(),
          finalUrl: z.string().optional(),
        })
      )
      .default([]),
    thumbnailUrl: z.string().default(""),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.price <= data.mrp, {
    message: "Selling Price cannot be greater than MRP",
    path: ["price"],
  });

export type VariantFormValues = z.infer<typeof variantFormSchema>;

// Main product schema (without variant-specific fields)
export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  brand: z.string().min(1, "Brand is required"),
  gtin: z.string().optional(),
  mpn: z.string().optional(),
  currency: z.string().default("INR"),
  ingredients: z.string().min(1, "Ingredients are required"),
  allergens: z.string().optional(),
  shelfLife: z.string().min(1, "Shelf life is required"),
  isVegetarian: z.boolean().default(true),
  isGlutenFree: z.boolean().default(false),
  keywords: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  favourite: z.boolean().optional(),
  variants: z
    .array(variantFormSchema)
    .min(1, "At least one variant is required"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// Default variant template
export const getDefaultVariant = (
  productName: string = ""
): VariantFormValues => ({
  sku: "",
  name: productName ? `${productName} - Default` : "Default Variant",
  price: 0,
  mrp: 0,
  discountPercent: 0,
  discountSource: "product",
  weight: 0,
  weightUnit: "g",
  packageSize: "",
  length: 0,
  height: 0,
  breadth: 0,
  stockQuantity: 0,
  availabilityStatus: "in_stock",
  images: [],
  thumbnailUrl: "",
  isDefault: true,
  isActive: true,
});
