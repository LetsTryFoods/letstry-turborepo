import { gql } from "@apollo/client";

const AUTHOR_FIELDS = `
  _id
  slug
  name
  jobTitle
  bio
  photoUrl
  publicEmail
  expertise
  credentials
  socialLinks {
    platform
    url
  }
  isFounder
  isTeamMember
  isActive
  position
  createdAt
  updatedAt
`;

export const GET_AUTHORS = gql`
  query GetAuthors {
    authors {
      ${AUTHOR_FIELDS}
    }
  }
`;

export const GET_ACTIVE_AUTHORS = gql`
  query GetActiveAuthors {
    activeAuthors {
      ${AUTHOR_FIELDS}
    }
  }
`;

export const GET_TEAM_MEMBERS = gql`
  query GetTeamMembers {
    teamMembers {
      ${AUTHOR_FIELDS}
    }
  }
`;

export const GET_AUTHOR = gql`
  query GetAuthor($id: ID!) {
    author(id: $id) {
      ${AUTHOR_FIELDS}
    }
  }
`;

export const GET_AUTHOR_BY_SLUG = gql`
  query GetAuthorBySlug($slug: String!) {
    authorBySlug(slug: $slug) {
      ${AUTHOR_FIELDS}
    }
  }
`;

export const CREATE_AUTHOR = gql`
  mutation CreateAuthor($input: CreateAuthorInput!) {
    createAuthor(input: $input) {
      ${AUTHOR_FIELDS}
    }
  }
`;

export const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor($id: ID!, $input: UpdateAuthorInput!) {
    updateAuthor(id: $id, input: $input) {
      ${AUTHOR_FIELDS}
    }
  }
`;

export const REMOVE_AUTHOR = gql`
  mutation RemoveAuthor($id: ID!) {
    removeAuthor(id: $id) {
      _id
      slug
    }
  }
`;
