import { gql } from '@apollo/client';

export const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      paymentOrderId
      redirectUrl
    }
  }
`;

export const GET_PAYMENT_STATUS = gql`
  query GetPaymentStatus($paymentOrderId: String!) {
    getPaymentStatus(paymentOrderId: $paymentOrderId) {
      paymentOrderId
      status
      message
      paymentOrder {
        _id
        amount
        currency
        paymentOrderStatus
        orderId
      }
    }
  }
`;
