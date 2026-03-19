import { gql } from 'graphql-request';

export const CREATE_GUEST_MUTATION = gql`
  mutation {
    createGuest(input: {}) {
      sessionId
      guestId
    }
  }
`;
