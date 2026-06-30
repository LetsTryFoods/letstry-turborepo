/**
 * NOTE: These queries use plain strings instead of the codegen `graphql()`
 * wrapper from `@/gql` because the new backend fields (`isSaleVariant`,
 * `bannerType`) and queries (`nearExpirySaleProducts`, `activeSaleBanners`)
 * are not yet reflected in the generated schema.
 *
 * Once you re-run `pnpm codegen` after the backend is deployed, you can
 * switch these back to `graphql(` from `@/gql` for full type-safety.
 *
 * The actual data fetching is done in `@/lib/sale/get-sale-data.ts`.
 */

export const GET_SALE_PRODUCTS = `
  query GetNearExpirySaleProducts {
    nearExpirySaleProducts {
      _id
      name
      slug
      brand
      defaultVariant {
        _id
        sku
        name
        price
        mrp
        discountPercent
        packageSize
        stockQuantity
        availabilityStatus
        thumbnailUrl
        isDefault
        isActive
        isSaleVariant
      }
      variants {
        _id
        sku
        name
        price
        mrp
        discountPercent
        packageSize
        stockQuantity
        availabilityStatus
        thumbnailUrl
        isDefault
        isActive
        isSaleVariant
      }
    }
  }
`;

export const GET_ACTIVE_SALE_BANNERS = `
  query GetActiveSaleBanners {
    activeSaleBanners {
      _id
      name
      headline
      subheadline
      description
      imageUrl
      mobileImageUrl
      url
      ctaText
      position
      isActive
      bannerType
    }
  }
`;
