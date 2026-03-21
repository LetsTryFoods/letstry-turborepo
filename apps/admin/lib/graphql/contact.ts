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

export const UPDATE_CONTACT_STATUS = gql`
  mutation UpdateContactStatus($id: String!, $status: String!) {
    updateContactStatus(id: $id, status: $status) {
      _id
      status
      updatedAt
    }
  }
`;

export const DELETE_CONTACT_MESSAGE = gql`
  mutation DeleteContactMessage($id: String!) {
    deleteContactMessage(id: $id)
  }
`;
