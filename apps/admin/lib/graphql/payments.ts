import { gql } from '@apollo/client'

export const GET_ADMIN_PAYMENTS_LIST = gql`
  query GetAdminPaymentsList($input: GetPaymentsListInput!) {
    getAdminPaymentsList(input: $input) {
      payments {
        _id
        paymentOrderId
        orderId
        identityId
        amount
        currency
        paymentOrderStatus
        paymentMethod
        createdAt
        completedAt
        pspTxnId
      }
      total
      page
      limit
      totalPages
      summary {
        totalPayments
        totalAmount
        totalRefunded
        successCount
        failedCount
        pendingCount
      }
    }
  }
`

export const GET_ADMIN_PAYMENT_DETAIL = gql`
  query GetAdminPaymentDetail($paymentOrderId: String!) {
    getAdminPaymentDetail(paymentOrderId: $paymentOrderId) {
      _id
      paymentOrderId
      paymentEventId
      identityId
      orderId
      amount
      currency
      paymentOrderStatus
      paymentMethod
      pspTxnId
      pspOrderId
      pspToken
      bankTxnId
      cardType
      cardNumber
      paymentMode
      cardScheme
      cardToken
      bankName
      bankId
      paymentMethodId
      cardHashId
      productDescription
      pspTxnTime
      ledgerUpdated
      retryCount
      pspResponseCode
      pspResponseMessage
      failureReason
      executedAt
      completedAt
      createdAt
      updatedAt
      refunds {
        _id
        refundId
        refundAmount
        currency
        reason
        refundStatus
        pspRefundId
        pspResponseCode
        pspResponseMessage
        processedAt
        createdAt
        updatedAt
      }
      cartSnapshot {
        items {
          productId
          sku
          name
          quantity
          unitPrice
          totalPrice
          mrp
          imageUrl
        }
        totals {
          subtotal
          discountAmount
          shippingCost
          estimatedTax
          handlingCharge
          grandTotal
        }
        shippingAddress {
          recipientName
          recipientPhone
          buildingName
          floor
          streetArea
          landmark
          addressLocality
          addressRegion
          postalCode
          addressCountry
          formattedAddress
        }
      }
    }
  }
`

export const INITIATE_ADMIN_REFUND = gql`
  mutation InitiateAdminRefund($input: InitiateAdminRefundInput!) {
    initiateAdminRefund(input: $input) {
      success
      refundId
      message
    }
  }
`

export const GET_ADMIN_PAYMENTS_BY_IDENTITY = gql`
  query GetAdminPaymentsByIdentity($identityId: String!) {
    getAdminPaymentsByIdentity(identityId: $identityId) {
      _id
      paymentOrderId
      orderId
      identityId
      amount
      currency
      paymentOrderStatus
      paymentMethod
      createdAt
      completedAt
      pspTxnId
    }
  }
`

export const GET_ADMIN_PAYMENTS_BY_ORDER = gql`
  query GetAdminPaymentsByOrder($orderId: String!) {
    getAdminPaymentsByOrder(orderId: $orderId) {
      _id
      paymentOrderId
      orderId
      identityId
      amount
      currency
      paymentOrderStatus
      paymentMethod
      createdAt
      completedAt
      pspTxnId
    }
  }
`
