/**
 * Sprint 4 hotfix — minimal product query that does NOT depend on any of the
 * Sprint 4 rich-content fields (longDescription, healthBenefits, nutrition,
 * pros, cons, productFaqs, pillarSlugs, etc.).
 *
 * Used as a fallback when the full Sprint 4 query (`GET_PRODUCT_BY_SLUG` in
 * ./products.ts) fails — typically because the backend hasn't been
 * redeployed yet with the matching schema additions, or a transient
 * GraphQL error. Without this fallback every product page would 404 the
 * moment the storefront and backend deploy out of order.
 *
 * Once the backend is confirmed redeployed and stable, this fallback can
 * be removed.
 */

import { graphql } from "@/gql";

export const GET_PRODUCT_BY_SLUG_MINIMAL = graphql(`
  query GetProductBySlugMinimal($slug: String!) {
    productBySlug(slug: $slug) {
      _id
      name
      slug
      description
      shelfLife
      isVegetarian
      isGlutenFree
      categoryIds
      ingredients
      allergens
      brand
      gtin
      mpn
      currency
      rating
      ratingCount
      keywords
      tags
      createdAt
      updatedAt
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
