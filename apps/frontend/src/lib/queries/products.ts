import { graphql } from '@/gql';

export const GET_PRODUCT_BY_SLUG = graphql(`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      _id
      name
      slug
      description
      shelfLife
      isVegetarian
      category {
        name
        imageUrl
      }
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
