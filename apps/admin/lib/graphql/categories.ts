import { gql } from '@apollo/client'

export const GET_CATEGORIES = gql`
  query GetCategories($pagination: PaginationInput!, $includeArchived: Boolean!) {
    categories(pagination: $pagination, includeArchived: $includeArchived) {
      items {
        id
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
  query GetRootCategories($pagination: PaginationInput!, $includeArchived: Boolean!) {
    rootCategories(pagination: $pagination, includeArchived: $includeArchived) {
      items {
        id
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
  query GetCategoryChildren($parentId: ID!, $pagination: PaginationInput!, $includeArchived: Boolean!) {
    categoryChildren(parentId: $parentId, pagination: $pagination, includeArchived: $includeArchived) {
      items {
        id
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
  query GetCategory($id: ID!, $includeArchived: Boolean!) {
    category(id: $id, includeArchived: $includeArchived) {
      id
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
      createdAt
      updatedAt
    }
  }
`

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!, $includeArchived: Boolean!) {
    categoryBySlug(slug: $slug, includeArchived: $includeArchived) {
      id
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
      createdAt
      updatedAt
    }
  }
`

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
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
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
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
      createdAt
      updatedAt
    }
  }
`

export const ARCHIVE_CATEGORY = gql`
  mutation ArchiveCategory($id: ID!) {
    archiveCategory(id: $id) {
      id
      name
      isArchived
    }
  }
`

export const UNARCHIVE_CATEGORY = gql`
  mutation UnarchiveCategory($id: ID!) {
    unarchiveCategory(id: $id) {
      id
      name
      isArchived
    }
  }
`
