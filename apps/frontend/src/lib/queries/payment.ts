import { gql } from "graphql-request";

export const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      paymentOrderId
      redirectUrl
    }
  }
`;
