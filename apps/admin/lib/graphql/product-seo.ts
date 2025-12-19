import { gql } from "@apollo/client";

// SEO fields fragment
const SEO_FIELDS = `
  _id
  productId
  metaTitle
  metaDescription
  metaKeywords
  canonicalUrl
  ogTitle
  ogDescription
  ogImage
  createdAt
  updatedAt
`;

// Get all product SEO entries
export const GET_PRODUCT_SEO_LIST = gql`
  query GetProductSeoList {
    productSeoList {
      ${SEO_FIELDS}
    }
  }
`;

// Get single product SEO by product ID
export const GET_PRODUCT_SEO = gql`
  query GetProductSeo($productId: ID!) {
    productSeo(productId: $productId) {
      ${SEO_FIELDS}
    }
  }
`;

// Get product SEO by slug
export const GET_PRODUCT_SEO_BY_SLUG = gql`
  query GetProductSeoBySlug($slug: String!) {
    productSeoBySlug(slug: $slug) {
      ${SEO_FIELDS}
    }
  }
`;

// Create product SEO
export const CREATE_PRODUCT_SEO = gql`
  mutation CreateProductSeo($input: CreateProductSeoInput!) {
    createProductSeo(input: $input) {
      ${SEO_FIELDS}
    }
  }
`;

// Update product SEO
export const UPDATE_PRODUCT_SEO = gql`
  mutation UpdateProductSeo($id: ID!, $input: UpdateProductSeoInput!) {
    updateProductSeo(id: $id, input: $input) {
      ${SEO_FIELDS}
    }
  }
`;

// Delete product SEO
export const DELETE_PRODUCT_SEO = gql`
  mutation DeleteProductSeo($id: ID!) {
    deleteProductSeo(id: $id)
  }
`;
