import { graphql } from '@/gql';

export const SEARCH_PRODUCTS = graphql(`
  query SearchProducts($searchTerm: String!, $pagination: PaginationInput, $nameOnly: Boolean) {
    searchProducts(searchTerm: $searchTerm, pagination: $pagination, nameOnly: $nameOnly) {
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
        tags
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
        availableVariants {
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
