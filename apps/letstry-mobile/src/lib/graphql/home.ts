import { gql } from '@apollo/client';

export const GET_ACTIVE_BANNERS = gql`
  query GetActiveBanners {
    activeBanners {
      _id
      name
      headline
      subheadline
      imageUrl
      mobileImageUrl
      url
      backgroundColor
      textColor
      position
    }
  }
`;

export const GET_ROOT_CATEGORIES = gql`
  query GetRootCategories($pagination: PaginationInput) {
    rootCategories(pagination: $pagination) {
      items {
        id
        name
        slug
        imageUrl
        favourite
      }
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      name
      slug
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!, $pagination: PaginationInput!) {
    productsByCategory(categoryId: $categoryId, pagination: $pagination) {
      items {
        _id
        name
        slug
        brand
        tags
        defaultVariant {
          _id
          sku
          price
          mrp
          discountPercent
          thumbnailUrl
          packageSize
          weight
          weightUnit
        }
      }
      meta {
        totalCount
        page
        totalPages
        hasNextPage
      }
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query GetProducts($pagination: PaginationInput!) {
    products(pagination: $pagination) {
      items {
        _id
        name
        slug
        brand
        tags
        defaultVariant {
          _id
          sku
          price
          mrp
          discountPercent
          thumbnailUrl
          packageSize
          weight
          weightUnit
        }
      }
      meta {
        totalCount
        page
        totalPages
        hasNextPage
      }
    }
  }
`;
