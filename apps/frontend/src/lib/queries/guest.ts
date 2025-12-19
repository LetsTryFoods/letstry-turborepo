import { graphql } from '@/gql';

export const CREATE_GUEST_MUTATION = graphql(`
  mutation CreateGuest($input: CreateGuestInput!) {
    createGuest(input: $input) {
      _id
      guestId
      sessionId
    }
  }
`);

export const UPDATE_GUEST_MUTATION = graphql(`
  mutation UpdateGuest($id: ID!, $input: UpdateGuestInput!) {
    updateGuest(id: $id, input: $input) {
      _id
      lastActiveAt
    }
  }
`);
