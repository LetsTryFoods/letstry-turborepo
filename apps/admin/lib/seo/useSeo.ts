import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_SEO_CONTENTS,
  GET_SEO_CONTENT,
  GET_SEO_CONTENT_BY_SLUG,
  CREATE_SEO_CONTENT,
  UPDATE_SEO_CONTENT,
  DELETE_SEO_CONTENT,
} from "@/lib/graphql/seo";

export interface SeoContent {
  _id: string;
  pageName: string;
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface CreateSeoContentInput {
  pageName: string;
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  isActive?: boolean;
}

export interface UpdateSeoContentInput extends Partial<CreateSeoContentInput> {}

// Get all SEO contents with pagination
export function useSeoContents(pagination: PaginationInput) {
  return useQuery(GET_SEO_CONTENTS, {
    variables: { pagination },
    fetchPolicy: "cache-and-network",
  });
}

// Get single SEO content by ID
export function useSeoContent(id: string) {
  return useQuery(GET_SEO_CONTENT, {
    variables: { id },
    skip: !id,
  });
}

// Get SEO content by page slug
export function useSeoContentBySlug(slug: string) {
  return useQuery(GET_SEO_CONTENT_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });
}

// Create SEO content
export function useCreateSeoContent() {
  return useMutation(CREATE_SEO_CONTENT, {
    refetchQueries: ["GetSeoContents"],
  });
}

// Update SEO content
export function useUpdateSeoContent() {
  return useMutation(UPDATE_SEO_CONTENT, {
    refetchQueries: ["GetSeoContents"],
  });
}

// Delete SEO content
export function useDeleteSeoContent() {
  return useMutation(DELETE_SEO_CONTENT, {
    refetchQueries: ["GetSeoContents"],
  });
}
