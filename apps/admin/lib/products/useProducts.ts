import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_PRODUCTS,
  GET_PRODUCTS_FOR_SEO,
  UPDATE_PRODUCT_SEO,
  GET_PRODUCT,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS_BY_CATEGORY,
  SEARCH_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  ARCHIVE_PRODUCT,
  UNARCHIVE_PRODUCT,
  UPDATE_PRODUCT_STOCK,
} from "@/lib/graphql/products";

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
  _id: string;
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
}

export interface PaginationMeta {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedProducts {
  items: Product[];
  meta: PaginationMeta;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface VariantInput {
  _id?: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  discountPercent: number;
  discountSource?: string;
  weight: number;
  weightUnit?: string;
  packageSize: string;
  length: number;
  height: number;
  breadth: number;
  stockQuantity: number;
  availabilityStatus?: string;
  images: ProductImage[];
  thumbnailUrl: string;
  isDefault: boolean;
  isActive?: boolean;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  description: string;
  categoryIds: string[];
  brand: string;
  gtin?: string;
  mpn?: string;
  currency?: string;
  ingredients: string;
  allergens?: string;
  shelfLife: string;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  keywords?: string[];
  tags?: string[];
  variants: VariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  categoryIds?: string[];
  brand?: string;
  gtin?: string;
  mpn?: string;
  currency?: string;
  ingredients?: string;
  allergens?: string;
  shelfLife?: string;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  keywords?: string[];
  tags?: string[];
  variants?: VariantInput[];
}

export const useProducts = (
  pagination: PaginationInput = { page: 1, limit: 10 },
  includeOutOfStock: boolean = false
) => {
  return useQuery(GET_PRODUCTS, {
    variables: { pagination, includeOutOfStock },
    fetchPolicy: "cache-and-network",
  });
};

// Products query for SEO page - includes SEO field embedded in product
export const useProductsForSeo = (
  pagination: PaginationInput = { page: 1, limit: 10 },
  includeOutOfStock: boolean = false
) => {
  return useQuery(GET_PRODUCTS_FOR_SEO, {
    variables: { pagination, includeOutOfStock },
    fetchPolicy: "cache-and-network",
  });
};

// Update product SEO via updateProduct mutation
export interface ProductSeoInput {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export const useUpdateProductSeo = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT_SEO, {
    refetchQueries: [
      {
        query: GET_PRODUCTS_FOR_SEO,
        variables: {
          pagination: { page: 1, limit: 20 },
          includeOutOfStock: true,
        },
      },
    ],
    onError: (error: any) => {
      console.error("Update product SEO error:", error);
    },
  });

  const updateProductSeo = async (
    productId: string,
    seoInput: ProductSeoInput
  ) => {
    return mutate({
      variables: {
        _id: productId,
        input: { seo: seoInput },
      },
    });
  };

  return { updateProductSeo, loading, error };
};

export const useProduct = (id: string) => {
  return useQuery(GET_PRODUCT, {
    variables: { _id: id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: "cache-and-network",
  });
};

export const useProductsByCategory = (
  categoryId: string,
  pagination: PaginationInput = { page: 1, limit: 10 }
) => {
  return useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId, pagination },
    skip: !categoryId,
    fetchPolicy: "cache-and-network",
  });
};

export const useSearchProducts = (
  searchTerm: string,
  pagination: PaginationInput = { page: 1, limit: 10 }
) => {
  return useQuery(SEARCH_PRODUCTS, {
    variables: { searchTerm, pagination },
    skip: !searchTerm,
    fetchPolicy: "cache-and-network",
  });
};

export const useCreateProduct = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [
      {
        query: GET_PRODUCTS,
        variables: {
          pagination: { page: 1, limit: 10 },
          includeOutOfStock: false,
        },
      },
    ],
    onError: (error: any) => {
      console.error("Create product error:", error);
    },
  });

  return { mutate, loading, error };
};

export const useUpdateProduct = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [
      {
        query: GET_PRODUCTS,
        variables: {
          pagination: { page: 1, limit: 10 },
          includeOutOfStock: false,
        },
      },
    ],
    onError: (error: any) => {
      console.error("Update product error:", error);
    },
  });

  return { mutate, loading, error };
};

export const useDeleteProduct = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [
      {
        query: GET_PRODUCTS,
        variables: {
          pagination: { page: 1, limit: 10 },
          includeOutOfStock: false,
        },
      },
    ],
    onError: (error: any) => {
      console.error("Delete product error:", error);
    },
  });

  return { mutate, loading, error };
};

export const useArchiveProduct = () => {
  const [mutate, { loading, error }] = useMutation(ARCHIVE_PRODUCT, {
    refetchQueries: [
      {
        query: GET_PRODUCTS,
        variables: {
          pagination: { page: 1, limit: 10 },
          includeOutOfStock: false,
        },
      },
    ],
    onError: (error: any) => {
      console.error("Archive product error:", error);
    },
  });

  return { mutate, loading, error };
};

export const useUnarchiveProduct = () => {
  const [mutate, { loading, error }] = useMutation(UNARCHIVE_PRODUCT, {
    refetchQueries: [
      {
        query: GET_PRODUCTS,
        variables: {
          pagination: { page: 1, limit: 10 },
          includeOutOfStock: true,
        },
      },
    ],
    onError: (error: any) => {
      console.error("Unarchive product error:", error);
    },
  });

  return { mutate, loading, error };
};

export const useUpdateProductStock = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT_STOCK, {
    refetchQueries: [
      {
        query: GET_PRODUCTS,
        variables: {
          pagination: { page: 1, limit: 10 },
          includeOutOfStock: false,
        },
      },
    ],
    onError: (error: any) => {
      console.error("Update product stock error:", error);
    },
  });

  return { mutate, loading, error };
};
