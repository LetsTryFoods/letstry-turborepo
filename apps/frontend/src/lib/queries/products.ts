import { graphql } from '@/gql';

export const GET_PRODUCTS_BY_CATEGORY = graphql(`
  query GetProductsByCategory($categoryId: ID!, $pagination: PaginationInput!) {
    productsByCategory(categoryId: $categoryId, pagination: $pagination) {
      items {
        _id
        name
        slug
        description
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

export const GET_PRODUCT_BY_SLUG = graphql(`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      _id
      name
      slug
      description
      shelfLife
      isVegetarian
      categoryIds
      ingredients
      seo {
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
      }
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
        images {
          url
          alt
        }
        isDefault
        isActive
      }
      defaultVariant {
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
        images {
          url
          alt
        }
        isDefault
        isActive
      }
      priceRange {
        min
        max
      }
      availableVariants {
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
        images {
          url
          alt
        }
        isDefault
        isActive
      }
    }
  }
`);
