import { gql } from 'graphql-request';

export const GET_MY_ORDERS_QUERY = gql`
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
        createdAt
        trackingNumber
        cancellationReason
        items {
          variantId
          quantity
          price
          totalPrice
          name
          sku
          image
        }
        payment {
          _id
          status
          method
          amount
        }
        shippingAddress {
          fullName
          phone
          addressLine1
          addressLine2
          city
          state
          pincode
        }
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
      }
    }
  }
`;

export const GET_ORDER_BY_ID_QUERY = gql`
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
      trackingNumber
      cancellationReason
      items {
        variantId
        quantity
        price
        totalPrice
        name
        sku
        image
      }
      payment {
        _id
        status
        method
        amount
      }
      shippingAddress {
        fullName
        phone
        addressLine1
        addressLine2
        city
        state
        pincode
      }
    }
  }
`;

export const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      _id
      orderId
      orderStatus
    }
  }
`;
