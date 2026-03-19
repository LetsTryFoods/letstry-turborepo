import { gql } from 'graphql-request';

export const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($searchTerm: String!, $page: Int!, $limit: Int!) {
    searchProducts(
      searchTerm: $searchTerm
      pagination: { page: $page, limit: $limit }
    ) {
      items {
        _id
        name
        slug
        description
        variants {
          _id
          sku
          name
          price
          mrp
          discountPercent
          weight
          weightUnit
          packageSize
          stockQuantity
          availabilityStatus
          isDefault
          isActive
          thumbnailUrl
        }
        defaultVariant {
          _id
          sku
          name
          price
          mrp
          stockQuantity
          isDefault
          isActive
        }
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
      }
    }
  }
`;
