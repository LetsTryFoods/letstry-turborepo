import { gql } from '@apollo/client'

export const GET_BLOGS = gql`
  query GetBlogs {
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
`

export const GET_ACTIVE_BLOGS = gql`
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
`

export const GET_BLOG = gql`
  query GetBlog($id: ID!) {
    blog(id: $id) {
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
`

export const CREATE_BLOG = gql`
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
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_BLOG = gql`
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
      createdAt
      updatedAt
    }
  }
`

export const DELETE_BLOG = gql`
  mutation DeleteBlog($id: ID!) {
    deleteBlog(id: $id) {
      _id
    }
  }
`
