import { gql } from '@apollo/client';

export const SUBMIT_CONTACT_MESSAGE = gql`
  mutation SubmitContactMessage($input: SubmitContactInput!) {
    submitContactMessage(input: $input) {
      success
      message
    }
  }
`;
