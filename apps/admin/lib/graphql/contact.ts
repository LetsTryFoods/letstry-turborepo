import { gql } from "@apollo/client";

export const GET_CONTACT_MESSAGES = gql`
  query GetContactMessages(
    $skip: Int
    $limit: Int
    $queryType: String
    $status: String
    $priority: String
    $search: String
    $activeChatsOnly: Boolean
  ) {
    getContactMessages(
      skip: $skip
      limit: $limit
      queryType: $queryType
      status: $status
      priority: $priority
      search: $search
      activeChatsOnly: $activeChatsOnly
    ) {
      data {
        _id
        name
        phone
        email
        orderId
        queryType
        productNames
        imageUrls
        message
        status
        whatsappPhoneNumber
        whatsappWindowExpiresAt
        whatsappTemplateSentAt
        lastInboundAt
        adminLastReadAt
        hasUnread
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

export const MARK_CONTACT_READ = gql`
  mutation MarkContactRead($id: String!) {
    markContactRead(id: $id)
  }
`;

