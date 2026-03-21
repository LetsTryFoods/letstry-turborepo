import { gql } from '@apollo/client';

export const GET_CONTACT_MESSAGES = gql`
  query GetContactMessages($skip: Int, $limit: Int) {
    getContactMessages(skip: $skip, limit: $limit) {
      data {
        _id
        name
        phone
        message
        status
        createdAt
        updatedAt
      }
      total
    }
  }
`;
