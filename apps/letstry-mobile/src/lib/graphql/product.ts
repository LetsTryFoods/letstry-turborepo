import { gql } from '@apollo/client';

export const GET_PRODUCT_DETAILS = gql`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      _id
      name
      slug
      description
      brand
      categoryIds
      ingredients
      allergens
      shelfLife
      isVegetarian
      isGlutenFree
      rating
      ratingCount
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
        thumbnailUrl
        isDefault
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      _id
      name
      slug
      description
      brand
      categoryIds
      ingredients
      allergens
      shelfLife
      isVegetarian
      isGlutenFree
      rating
      ratingCount
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
        thumbnailUrl
        isDefault
      }
    }
  }
`;
