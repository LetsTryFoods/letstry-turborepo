import { gql } from 'graphql-request';

export const GET_ALL_PRODUCTS_FOR_SITEMAP = gql`
  query GetAllProductsForSitemap {
    products(pagination: { page: 1, limit: 1000 }) {
      items {
        slug
        updatedAt
      }
    }
  }
`;

export const GET_ALL_CATEGORIES_FOR_SITEMAP = gql`
  query GetAllCategoriesForSitemap {
    categories(pagination: { page: 1, limit: 1000 }) {
      items {
        slug
        updatedAt
      }
    }
  }
`;
