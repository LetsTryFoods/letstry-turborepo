export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  discountPercent: number;
  discountSource: string;
  weight: number;
  weightUnit: string;
  packageSize: string;
  length: number;
  height: number;
  breadth: number;
  stockQuantity: number;
  availabilityStatus: string;
  images: ProductImage[];
  thumbnailUrl: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSeo {
  _id: string;
  productId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  categoryIds: string[];
  brand: string;
  gtin?: string;
  mpn?: string;
  currency: string;
  ingredients: string;
  allergens?: string;
  shelfLife: string;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  variants: ProductVariant[];
  rating?: number;
  ratingCount: number;
  keywords: string[];
  tags: string[];
  isArchived: boolean;
  favourite?: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  defaultVariant?: ProductVariant;
  priceRange?: PriceRange;
  availableVariants?: ProductVariant[];
  seo?: ProductSeo;
  // Legacy fields for backward compatibility (computed from defaultVariant)
  sku?: string;
  images?: ProductImage[];
  thumbnailUrl?: string;
  price?: number;
  mrp?: number;
  discountPercent?: number;
  length?: number;
  height?: number;
  breadth?: number;
  weight?: number;
  weightUnit?: string;
  packageSize?: string;
  stockQuantity?: number;
  availabilityStatus?: string | boolean;
  discountSource?: string;
}

export interface ProductColumn {
  key: string;
  label: string;
}
