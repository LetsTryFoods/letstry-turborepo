import { gql } from 'graphql-request';

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
`;

export const GET_ACTIVE_PRESS_MENTIONS = gql`
  query GetActivePressMentions {
    activePressMentions {
      ${PRESS_MENTION_FIELDS}
    }
  }
`;
