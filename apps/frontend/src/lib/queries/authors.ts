import { gql } from 'graphql-request';

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
  socialLinks { platform url }
  isFounder
  isTeamMember
  isActive
  position
`;

export const GET_AUTHOR_BY_SLUG = gql`
  query GetAuthorBySlug($slug: String!) {
    authorBySlug(slug: $slug) {
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

export const GET_ACTIVE_AUTHORS = gql`
  query GetActiveAuthors {
    activeAuthors {
      ${AUTHOR_FIELDS}
    }
  }
`;
