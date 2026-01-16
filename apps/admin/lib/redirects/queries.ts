import { gql } from '@apollo/client'

export const GET_REDIRECTS = gql`
  query GetRedirects($page: Int!, $limit: Int!, $search: String) {
    redirects(page: $page, limit: $limit, search: $search) {
      data {
        _id
        fromPath
        toPath
        statusCode
        isActive
        description
        source
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`

export const GET_REDIRECT = gql`
  query GetRedirect($id: String!) {
    redirect(id: $id) {
      _id
      fromPath
      toPath
      statusCode
      isActive
      description
      source
      createdAt
      updatedAt
    }
  }
`

export const CREATE_REDIRECT = gql`
  mutation CreateRedirect($input: CreateRedirectInput!) {
    createRedirect(input: $input) {
      _id
      fromPath
      toPath
      statusCode
      isActive
      description
      source
    }
  }
`

export const UPDATE_REDIRECT = gql`
  mutation UpdateRedirect($id: String!, $input: UpdateRedirectInput!) {
    updateRedirect(id: $id, input: $input) {
      _id
      fromPath
      toPath
      statusCode
      isActive
      description
      source
    }
  }
`

export const DELETE_REDIRECT = gql`
  mutation DeleteRedirect($id: String!) {
    deleteRedirect(id: $id)
  }
`

export const GET_ALL_ACTIVE_REDIRECTS = gql`
  query GetAllActiveRedirects {
    allActiveRedirects {
      _id
      fromPath
      toPath
      statusCode
    }
  }
`
