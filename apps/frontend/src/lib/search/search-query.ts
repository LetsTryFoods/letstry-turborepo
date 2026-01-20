import { graphql } from '@/gql';

export const SEARCH_PRODUCTS = graphql(`
  query SearchProducts($searchTerm: String!, $pagination: PaginationInput) {
    searchProducts(searchTerm: $searchTerm, pagination: $pagination) {
      items {
        _id
        name
        slug
        description
        categoryIds
        brand
        currency
        isArchived
        favourite
        createdAt
        updatedAt
        defaultVariant {
          _id
          sku
          name
          price
          mrp
          discountPercent
          discountSource
          weight
          weightUnit
          packageSize
          length
          height
          breadth
          stockQuantity
          availabilityStatus
          images {
            url
            alt
          }
          thumbnailUrl
          isDefault
          isActive
        }
        priceRange {
          min
          max
        }
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
`);
