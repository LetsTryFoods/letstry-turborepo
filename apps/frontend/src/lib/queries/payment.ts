import { gql } from 'graphql-request';

export const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      paymentOrderId
      checkoutUrl
      checksumData {
        amount
        merchantIdentifier
        orderId
        buyerEmail
        buyerFirstName
        buyerPhoneNumber
        currency
        txnType
        zpPayOption
        mode
        productDescription
        txnDate
        checksum
      }
    }
  }
`;

export const INITIATE_UPI_QR_PAYMENT = gql`
  mutation InitiateUpiQrPayment($input: InitiateUpiQrPaymentInput!) {
    initiateUpiQrPayment(input: $input) {
      paymentOrderId
      qrCodeData
      qrCodeUrl
      zaakpayTxnId
      amount
      currency
      expiresAt
      responseCode
      responseMessage
    }
  }
`;

export const INITIATE_CARD_PAYMENT = gql`
  mutation InitiateCardPayment($input: InitiateCardPaymentInput!) {
    initiateCardPayment(input: $input) {
      paymentOrderId
      status
      zaakpayTxnId
      redirectUrl
      responseCode
      responseMessage
      cardType
      maskedCardNumber
    }
  }
`;
