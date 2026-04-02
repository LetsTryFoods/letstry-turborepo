export interface ProductVariant {
  _id: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  discountPercent: number;
  weight: number;
  weightUnit: string;
  packageSize: string;
  stockQuantity: number;
  availabilityStatus: string;
  images: { url: string; alt: string }[];
  thumbnailUrl: string;
  isDefault: boolean;
}

export interface ProductDetails {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  brand: string;
  categoryIds: string[];
  ingredients: string;
  allergens?: string;
  shelfLife: string;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  rating?: number;
  ratingCount: number;
  variants: ProductVariant[];
}
