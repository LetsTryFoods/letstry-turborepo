export interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryIds: string[];
  defaultVariant: {
    _id: string;
    price: number;
    mrp: number;
    discountPercent: number;
    stockQuantity: number;
    availabilityStatus: string;
    thumbnailUrl: string;
    images: { url: string; alt: string }[];
  } | null;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface SearchState {
  query: string;
  results: SearchProduct[];
  loading: boolean;
  recentSearches: string[];
}
