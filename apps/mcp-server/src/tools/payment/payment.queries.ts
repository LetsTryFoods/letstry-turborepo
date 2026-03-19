import { gql } from 'graphql-request';

export const INITIATE_PAYMENT_MUTATION = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      paymentOrderId
      redirectUrl
    }
  }
`;

export const GET_PAYMENT_STATUS_QUERY = gql`
  query GetPaymentStatus($paymentOrderId: String!) {
    getPaymentStatus(paymentOrderId: $paymentOrderId) {
      paymentOrderId
      status
      message
      paymentOrder {
        _id
        paymentOrderId
        amount
        currency
        paymentOrderStatus
        paymentMethod
        paymentMode
        pspTxnId
        failureReason
        completedAt
        createdAt
      }
    }
  }
`;
