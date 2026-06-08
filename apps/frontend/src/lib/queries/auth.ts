import { gql } from "graphql-request";

export const LOGOUT_MUTATION = gql`
  mutation AdminLogout {
    adminLogout
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      _id
      firstName
      lastName
      email
      phoneNumber
      dateOfBirth
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      _id
      phoneNumber
      firstName
      lastName
      email
      dateOfBirth
    }
  }
`;
