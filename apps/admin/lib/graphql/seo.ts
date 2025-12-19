import { gql } from "@apollo/client";

export const GET_SEO_CONTENTS = gql`
  query GetSeoContents($pagination: PaginationInput!) {
    seoContents(pagination: $pagination) {
      items {
        _id
        pageName
        pageSlug
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
        isActive
        createdAt
        updatedAt
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

export const GET_SEO_CONTENT = gql`
  query GetSeoContent($id: ID!) {
    seoContent(id: $id) {
      _id
      pageName
      pageSlug
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_SEO_CONTENT_BY_SLUG = gql`
  query GetSeoContentBySlug($slug: String!) {
    seoContentBySlug(slug: $slug) {
      _id
      pageName
      pageSlug
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
      isActive
    }
  }
`;

export const CREATE_SEO_CONTENT = gql`
  mutation CreateSeoContent($input: CreateSeoContentInput!) {
    createSeoContent(input: $input) {
      _id
      pageName
      pageSlug
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
      isActive
      createdAt
    }
  }
`;

export const UPDATE_SEO_CONTENT = gql`
  mutation UpdateSeoContent($id: ID!, $input: UpdateSeoContentInput!) {
    updateSeoContent(id: $id, input: $input) {
      _id
      pageName
      pageSlug
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
      isActive
      updatedAt
    }
  }
`;

export const DELETE_SEO_CONTENT = gql`
  mutation DeleteSeoContent($id: ID!) {
    deleteSeoContent(id: $id)
  }
`;
