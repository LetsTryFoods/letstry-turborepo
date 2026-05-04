import { gql } from "@apollo/client";

const PRESS_MENTION_FIELDS = `
  _id
  slug
  publication
  publicationLogoUrl
  headline
  url
  excerpt
  coverImageUrl
  publishedAt
  category
  isActive
  position
  createdAt
  updatedAt
`;

export const GET_PRESS_MENTIONS = gql`
  query GetPressMentions {
    pressMentions {
      ${PRESS_MENTION_FIELDS}
    }
  }
`;

export const GET_ACTIVE_PRESS_MENTIONS = gql`
  query GetActivePressMentions {
    activePressMentions {
      ${PRESS_MENTION_FIELDS}
    }
  }
`;

export const GET_PRESS_MENTION = gql`
  query GetPressMention($id: ID!) {
    pressMention(id: $id) {
      ${PRESS_MENTION_FIELDS}
    }
  }
`;

export const GET_PRESS_MENTION_BY_SLUG = gql`
  query GetPressMentionBySlug($slug: String!) {
    pressMentionBySlug(slug: $slug) {
      ${PRESS_MENTION_FIELDS}
    }
  }
`;

export const CREATE_PRESS_MENTION = gql`
  mutation CreatePressMention($input: CreatePressMentionInput!) {
    createPressMention(input: $input) {
      ${PRESS_MENTION_FIELDS}
    }
  }
`;

export const UPDATE_PRESS_MENTION = gql`
  mutation UpdatePressMention($id: ID!, $input: UpdatePressMentionInput!) {
    updatePressMention(id: $id, input: $input) {
      ${PRESS_MENTION_FIELDS}
    }
  }
`;

export const REMOVE_PRESS_MENTION = gql`
  mutation RemovePressMention($id: ID!) {
    removePressMention(id: $id) {
      _id
      slug
    }
  }
`;
