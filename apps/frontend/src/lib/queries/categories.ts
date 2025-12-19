import { graphql } from '@/gql';

export const GET_ROOT_CATEGORIES = graphql(`
  query GetRootCategories($pagination: PaginationInput, $includeArchived: Boolean) {
    rootCategories(pagination: $pagination, includeArchived: $includeArchived) {
      items {
        id
        name
        slug
        imageUrl
      }
      meta {
        totalCount
        totalPages
        page
        limit
        hasNextPage
        hasPreviousPage
      }
    }
  }
`);

export const GET_CATEGORY_WITH_PRODUCTS = graphql(`
  query GetCategoryWithProducts($id: ID!, $includeArchived: Boolean) {
    category(id: $id, includeArchived: $includeArchived) {
      id
      name
      slug
      description
      imageUrl
      codeValue
      inCodeSet
      productCount
      isArchived
      favourite
      products {
        _id
        name
        slug
        brand
        defaultVariant {
          sku
          price
          mrp
          discountPercent
          thumbnailUrl
          availabilityStatus
          stockQuantity
        }
        availableVariants {
          _id
          sku
          price
          mrp
          packageSize
          weight
          weightUnit
        }
      }
      createdAt
      updatedAt
    }
  }
`);

export const GET_CATEGORY_BY_SLUG = graphql(`
  query GetCategoryBySlug($slug: String!, $includeArchived: Boolean) {
    categoryBySlug(slug: $slug, includeArchived: $includeArchived) {
      id
      name
      slug
      productCount
      products {
        _id
        name
        slug
        defaultVariant {
          thumbnailUrl
          price
          mrp
          packageSize
        }
        availableVariants {
          _id
          sku
          price
          mrp
          packageSize
          weight
          weightUnit
        }
        tags
      }
    }
  }
`);

