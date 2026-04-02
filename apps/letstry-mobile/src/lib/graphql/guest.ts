import { gql } from '@apollo/client';

export const CREATE_GUEST = gql`
  mutation CreateGuest($input: CreateGuestInput!) {
    createGuest(input: $input) {
      _id
      guestId
      sessionId
    }
  }
`;

export const UPDATE_GUEST_MUTATION = gql`
  mutation UpdateGuest($id: ID!, $input: UpdateGuestInput!) {
    updateGuest(id: $id, input: $input) {
      _id
      guestId
      sessionId
    }
  }
`;
