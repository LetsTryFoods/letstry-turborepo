import { gql } from '@apollo/client';

export const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories {
      _id
      name
      slug
      description
      isActive
      position
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACTIVE_BLOG_CATEGORIES = gql`
  query GetActiveBlogCategories {
    activeBlogCategories {
      _id
      name
      slug
      description
      isActive
      position
    }
  }
`;

export const CREATE_BLOG_CATEGORY = gql`
  mutation CreateBlogCategory($input: CreateBlogCategoryInput!) {
    createBlogCategory(input: $input) {
      _id
      name
      slug
      description
      isActive
      position
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BLOG_CATEGORY = gql`
  mutation UpdateBlogCategory($id: ID!, $input: UpdateBlogCategoryInput!) {
    updateBlogCategory(id: $id, input: $input) {
      _id
      name
      slug
      description
      isActive
      position
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BLOG_CATEGORY = gql`
  mutation DeleteBlogCategory($id: ID!) {
    deleteBlogCategory(id: $id) {
      _id
      name
    }
  }
`;
