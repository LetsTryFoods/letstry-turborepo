import { graphql } from '@/gql';

export const GET_ACTIVE_BLOGS = graphql(`
  query GetActiveBlogs {
    activeBlogs {
      _id
      slug
      title
      excerpt
      content
      image
      date
      author
      category
      isActive
      position
      createdAt
      updatedAt
    }
  }
`);

export const GET_BLOG_BY_SLUG = graphql(`
  query GetBlogBySlug($slug: String!) {
    blogBySlug(slug: $slug) {
      _id
      slug
      title
      excerpt
      content
      image
      date
      author
      category
      isActive
      position
      createdAt
      updatedAt
    }
  }
`);

export const GET_ALL_BLOGS = graphql(`
  query GetAllBlogs {
    blogs {
      _id
      slug
      title
      excerpt
      content
      image
      date
      author
      category
      isActive
      position
      createdAt
      updatedAt
    }
  }
`);
