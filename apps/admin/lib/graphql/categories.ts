import { gql } from '@apollo/client'

export const GET_CATEGORIES = gql`
  query GetCategories($pagination: PaginationInput, $includeArchived: Boolean) {
    categories(pagination: $pagination, includeArchived: $includeArchived) {
      items {
        _id
        name
        slug
        description
        parentId
        imageUrl
        codeValue
        inCodeSet
        productCount
        favourite
        isArchived
        seo {
          metaTitle
          metaDescription
          metaKeywords
          canonicalUrl
          ogTitle
          ogDescription
          ogImage
        }
        createdAt
        updatedAt
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_ROOT_CATEGORIES = gql`
  query GetRootCategories($pagination: PaginationInput, $includeArchived: Boolean) {
    rootCategories(pagination: $pagination, includeArchived: $includeArchived) {
      items {
        _id
        name
        slug
        description
        parentId
        imageUrl
        codeValue
        inCodeSet
        productCount
        favourite
        isArchived
        seo {
          metaTitle
          metaDescription
          metaKeywords
          canonicalUrl
          ogTitle
          ogDescription
          ogImage
        }
        createdAt
        updatedAt
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_CATEGORY_CHILDREN = gql`
  query GetCategoryChildren($parentId: ID!, $pagination: PaginationInput, $includeArchived: Boolean) {
    categoryChildren(parentId: $parentId, pagination: $pagination, includeArchived: $includeArchived) {
      items {
        _id
        name
        slug
        description
        parentId
        imageUrl
        codeValue
        inCodeSet
        productCount
        favourite
        isArchived
        seo {
          metaTitle
          metaDescription
          metaKeywords
          canonicalUrl
          ogTitle
          ogDescription
          ogImage
        }
        createdAt
        updatedAt
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_CATEGORY = gql`
  query GetCategory($_id: ID!, $includeArchived: Boolean) {
    category(_id: $_id, includeArchived: $includeArchived) {
      _id
      name
      slug
      description
      parentId
      imageUrl
      codeValue
      inCodeSet
      productCount
      favourite
      isArchived
      seo {
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!, $includeArchived: Boolean) {
    categoryBySlug(slug: $slug, includeArchived: $includeArchived) {
      _id
      name
      slug
      description
      parentId
      imageUrl
      codeValue
      inCodeSet
      productCount
      favourite
      isArchived
      seo {
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
      }
      createdAt
      updatedAt
    }
  }
`

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      _id
      name
      slug
      description
      parentId
      imageUrl
      codeValue
      inCodeSet
      productCount
      favourite
      isArchived
      seo {
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
      }
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($_id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(_id: $_id, input: $input) {
      _id
      name
      slug
      description
      parentId
      imageUrl
      codeValue
      inCodeSet
      productCount
      favourite
      isArchived
      seo {
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
      }
      createdAt
      updatedAt
    }
  }
`

export const ARCHIVE_CATEGORY = gql`
  mutation ArchiveCategory($_id: ID!) {
    archiveCategory(_id: $_id) {
      _id
      name
      isArchived
    }
  }
`

export const UNARCHIVE_CATEGORY = gql`
  mutation UnarchiveCategory($_id: ID!) {
    unarchiveCategory(_id: $_id) {
      _id
      name
      isArchived
    }
  }
`
