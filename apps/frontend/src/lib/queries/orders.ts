import { gql } from "graphql-request";

export const GET_MY_ORDERS = gql`
  query GetMyOrders($input: GetMyOrdersInput!) {
    getMyOrders(input: $input) {
      orders {
        _id
        orderId
        orderStatus
        totalAmount
        subtotal
        discount
        deliveryCharge
        currency
        trackingNumber
        createdAt
        deliveredAt
        cancelledAt
        cancellationReason
        items {
          variantId
          quantity
          price
          totalPrice
          name
          sku
          variant
          image
        }
        payment {
          _id
          status
          method
          transactionId
          amount
          paidAt
        }
        shippingAddress {
          fullName
          phone
          addressType
          addressLine1
          addressLine2
          floor
          city
          state
          pincode
          landmark
          formattedAddress
        }
        customer {
          _id
          name
          email
          phone
        }
      }
      meta {
        totalCount
        page
        limit
        totalPages
      }
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($orderId: String!) {
    getOrderById(orderId: $orderId) {
      _id
      orderId
      orderStatus
      totalAmount
      subtotal
      discount
      deliveryCharge
      currency
      createdAt
      items {
        variantId
        quantity
        price
        totalPrice
        name
        sku
        variant
      }
      payment {
        status
        method
        transactionId
        amount
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      _id
      orderId
      orderStatus
      cancelledAt
      cancellationReason
    }
  }
`;
