import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_PRODUCT_SEO_LIST,
  GET_PRODUCT_SEO,
  GET_PRODUCT_SEO_BY_SLUG,
  CREATE_PRODUCT_SEO,
  UPDATE_PRODUCT_SEO,
  DELETE_PRODUCT_SEO,
} from "@/lib/graphql/product-seo";

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

export interface CreateProductSeoInput {
  productId: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface UpdateProductSeoInput extends Partial<Omit<CreateProductSeoInput, 'productId'>> {}

// Get all product SEO entries - TEMPORARILY SKIPPED until backend is ready
export function useProductSeoList() {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_SEO_LIST, {
    fetchPolicy: "cache-and-network",
    skip: true, // Skip until backend API is ready
  });

  // Return empty array while skipped
  const productSeoList: ProductSeo[] = (data as any)?.productSeoList || [];

  return { productSeoList, loading: false, error: null, refetch };
}

// Get single product SEO by product ID
export function useProductSeo(productId: string) {
  return useQuery(GET_PRODUCT_SEO, {
    variables: { productId },
    skip: true, // Skip until backend API is ready
    fetchPolicy: "cache-and-network",
  });
}

// Get product SEO by slug
export function useProductSeoBySlug(slug: string) {
  return useQuery(GET_PRODUCT_SEO_BY_SLUG, {
    variables: { slug },
    skip: true, // Skip until backend API is ready
    fetchPolicy: "cache-and-network",
  });
}

// Create product SEO - TEMPORARILY MOCKED until backend is ready
export function useCreateProductSeo() {
  const [mutate, { loading, error }] = useMutation(CREATE_PRODUCT_SEO, {
    refetchQueries: [{ query: GET_PRODUCT_SEO_LIST }],
    onError: (error: any) => {
      console.error("Create product SEO error:", error);
    },
  });

  const createProductSeo = async (input: CreateProductSeoInput) => {
    // TODO: Remove this when backend is ready
    console.log("Creating product SEO (backend not ready):", input);
    return { data: { createProductSeo: { _id: "temp-" + Date.now(), ...input } } };
    // return mutate({ variables: { input } });
  };

  return { createProductSeo, loading, error };
}

// Update product SEO - TEMPORARILY MOCKED until backend is ready
export function useUpdateProductSeo() {
  const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT_SEO, {
    refetchQueries: [{ query: GET_PRODUCT_SEO_LIST }],
    onError: (error: any) => {
      console.error("Update product SEO error:", error);
    },
  });

  const updateProductSeo = async (id: string, input: UpdateProductSeoInput) => {
    // TODO: Remove this when backend is ready
    console.log("Updating product SEO (backend not ready):", id, input);
    return { data: { updateProductSeo: { _id: id, ...input } } };
    // return mutate({ variables: { id, input } });
  };

  return { updateProductSeo, loading, error };
}

// Delete product SEO - TEMPORARILY MOCKED until backend is ready
export function useDeleteProductSeo() {
  const [mutate, { loading, error }] = useMutation(DELETE_PRODUCT_SEO, {
    refetchQueries: [{ query: GET_PRODUCT_SEO_LIST }],
    onError: (error: any) => {
      console.error("Delete product SEO error:", error);
    },
  });

  const deleteProductSeo = async (id: string) => {
    // TODO: Remove this when backend is ready
    console.log("Deleting product SEO (backend not ready):", id);
    return { data: { deleteProductSeo: true } };
    // return mutate({ variables: { id } });
  };

  return { deleteProductSeo, loading, error };
}
