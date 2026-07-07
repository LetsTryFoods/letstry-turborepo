import { graphql } from "@/gql";

export const SALE_PRODUCTS_PAGINATED = graphql(`
  query SaleProductsPaginated($pagination: PaginationInput) {
    saleProductsPaginated(pagination: $pagination) {
      items {
        _id
        name
        slug
        defaultVariant {
          _id
          thumbnailUrl
          price
          mrp
        }
        variants {
          _id
          packageSize
          price
          mrp
          availabilityStatus
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
