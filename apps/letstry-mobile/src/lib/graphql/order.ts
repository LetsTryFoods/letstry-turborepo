import { gql } from '@apollo/client';

export const GET_MY_ORDERS = gql`
  query GetMyOrders($input: GetMyOrdersInput!) {
    getMyOrders(input: $input) {
      orders {
        _id
        orderId
        totalAmount
        deliveryCharge
        orderStatus
        createdAt
        items {
          name
          quantity
          price
          image
          variant
        }
      }
      meta {
        total
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
      totalAmount
      subtotal
      discount
      deliveryCharge
      orderStatus
      createdAt
      items {
        name
        quantity
        price
        image
        variant
        totalPrice
      }
      shippingAddress {
        fullName
        phone
        addressLine1
        city
        state
        pincode
        landmark
      }
      payment {
        method
        status
        amount
      }
    }
  }
`;
