import { graphql } from '@/gql';

export const CREATE_BLOG = graphql(`
  mutation CreateBlog($input: CreateBlogInput!) {
    createBlog(input: $input) {
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
    }
  }
`);

export const UPDATE_BLOG = graphql(`
  mutation UpdateBlog($id: ID!, $input: UpdateBlogInput!) {
    updateBlog(id: $id, input: $input) {
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
    }
  }
`);

export const DELETE_BLOG = graphql(`
  mutation DeleteBlog($id: ID!) {
    deleteBlog(id: $id) {
      _id
      slug
      title
    }
  }
`);
