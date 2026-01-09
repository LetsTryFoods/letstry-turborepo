import { gql } from "@apollo/client";

export const GET_CATEGORIES_WITH_SEO = gql`
  query GetCategoriesWithSeo($pagination: PaginationInput, $includeArchived: Boolean) {
    categories(pagination: $pagination, includeArchived: $includeArchived) {
      items {
        _id
        name
        slug
        description
        imageUrl
        seo {
          _id
          categoryId
          metaTitle
          metaDescription
          metaKeywords
          canonicalUrl
          ogTitle
          ogDescription
          ogImage
          createdAt
          updatedAt
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
`;

export const GET_CATEGORY_SEO = gql`
  query GetCategorySeo($categoryId: ID!) {
    categorySeo(categoryId: $categoryId) {
      _id
      categoryId
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CATEGORY_SEO = gql`
  mutation UpdateCategorySeo($categoryId: ID!, $input: CategorySeoInput!) {
    updateCategorySeo(categoryId: $categoryId, input: $input) {
      _id
      categoryId
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY_SEO = gql`
  mutation DeleteCategorySeo($categoryId: ID!) {
    deleteCategorySeo(categoryId: $categoryId)
  }
`;
