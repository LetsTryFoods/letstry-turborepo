import { gql } from '@apollo/client'

// Placeholder GraphQL queries/mutations for Orders
// TODO: Implement these in backend

export const GET_ORDERS = gql`
  query GetOrders($status: String, $page: Int, $limit: Int) {
    orders(status: $status, page: $page, limit: $limit) {
      _id
      orderNumber
      customer {
        _id
        name
        email
        phone
      }
      items {
        product {
          _id
          name
          image
        }
        variant
        quantity
        price
      }
      shippingAddress {
        fullName
        phone
        addressLine1
        addressLine2
        city
        state
        pincode
        landmark
      }
      payment {
        _id
        method
        status
        transactionId
        amount
        paidAt
      }
      subtotal
      deliveryCharge
      discount
      total
      status
      createdAt
      updatedAt
    }
  }
`

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      _id
      orderNumber
      customer {
        _id
        name
        email
        phone
      }
      items {
        product {
          _id
          name
          image
        }
        variant
        quantity
        price
      }
      shippingAddress {
        fullName
        phone
        addressLine1
        addressLine2
        city
        state
        pincode
        landmark
      }
      payment {
        _id
        method
        status
        transactionId
        amount
        paidAt
      }
      subtotal
      deliveryCharge
      discount
      total
      status
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      _id
      status
    }
  }
`
