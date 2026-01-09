import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_CATEGORIES,
  GET_ROOT_CATEGORIES,
  GET_CATEGORY_CHILDREN,
  GET_CATEGORY,
  GET_CATEGORY_BY_SLUG,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  ARCHIVE_CATEGORY,
  UNARCHIVE_CATEGORY
} from '@/lib/graphql/categories'

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  imageUrl?: string
  codeValue: string
  inCodeSet: string
  productCount: number
  favourite: boolean
  isArchived: boolean
  seo?: any // Using any for simplicity here or I can define SeoBase
  createdAt: string
  updatedAt: string
}

export interface BreadcrumbCategory {
  id: string
  name: string
  slug: string
}

export interface PaginationMeta {
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedCategories {
  items: Category[]
  meta: PaginationMeta
}

export interface PaginationInput {
  page?: number
  limit?: number
}

export interface CreateCategoryInput {
  name: string
  slug?: string
  description?: string
  parentId?: string
  imageUrl?: string
  codeValue: string
  inCodeSet: string
  favourite?: boolean
  isArchived?: boolean
  seo?: any
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  description?: string
  parentId?: string
  imageUrl?: string
  codeValue?: string
  inCodeSet?: string
  favourite?: boolean
  isArchived?: boolean
  seo?: any
}

export const useCategories = (pagination: PaginationInput = { page: 1, limit: 100 }, includeArchived: boolean = false) => {
  return useQuery(GET_CATEGORIES, {
    variables: { pagination, includeArchived },
    fetchPolicy: 'cache-and-network',
  })
}

export const useRootCategories = (pagination: PaginationInput = { page: 1, limit: 100 }, includeArchived: boolean = false) => {
  return useQuery(GET_ROOT_CATEGORIES, {
    variables: { pagination, includeArchived },
    fetchPolicy: 'cache-and-network',
  })
}

export const useCategoryChildren = (parentId: string, pagination: PaginationInput = { page: 1, limit: 100 }, includeArchived: boolean = false) => {
  return useQuery(GET_CATEGORY_CHILDREN, {
    variables: { parentId, pagination, includeArchived },
    skip: !parentId,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCategory = (id: string, includeArchived: boolean = false) => {
  return useQuery(GET_CATEGORY, {
    variables: { _id: id, includeArchived },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCategoryBySlug = (slug: string, includeArchived: boolean = false) => {
  return useQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug, includeArchived },
    skip: !slug,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreateCategory = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: ['GetCategories', 'GetRootCategories'],
    onError: (error: any) => {
      console.error('Create category error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useUpdateCategory = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: ['GetCategories', 'GetRootCategories'],
    onError: (error: any) => {
      console.error('Update category error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useArchiveCategory = () => {
  const [mutate, { loading, error }] = useMutation(ARCHIVE_CATEGORY, {
    refetchQueries: ['GetCategories', 'GetRootCategories'],
    onError: (error: any) => {
      console.error('Archive category error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useUnarchiveCategory = () => {
  const [mutate, { loading, error }] = useMutation(UNARCHIVE_CATEGORY, {
    refetchQueries: ['GetCategories', 'GetRootCategories'],
    onError: (error: any) => {
      console.error('Unarchive category error:', error)
    }
  })

  return { mutate, loading, error }
}
