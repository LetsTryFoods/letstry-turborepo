import { gql } from '@apollo/client'

export const GET_ALL_ORDERS = gql`
  query GetAllOrders($input: GetAllOrdersInput!) {
    getAllOrders(input: $input) {
      orders {
        _id
        orderId
        customer {
          _id
          name
          email
          phone
        }
        items {
          variantId
          name
          sku
          variant
          image
          quantity
          price
          totalPrice
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
          latitude
          longitude
        }
        payment {
          _id
          status
          method
          transactionId
          amount
          paidAt
        }
        subtotal
        deliveryCharge
        discount
        totalAmount
        orderStatus
        createdAt
        updatedAt
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
      summary {
        totalOrders
        totalRevenue
        statusCounts {
          confirmed
          packed
          shipped
          inTransit
          delivered
        }
      }
    }
  }
`

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($orderId: String!) {
    getOrderById(orderId: $orderId) {
      _id
      orderId
      customer {
        _id
        name
        email
        phone
      }
      items {
        variantId
        name
        sku
        variant
        image
        quantity
        price
        totalPrice
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
        latitude
        longitude
      }
      payment {
        _id
        status
        method
        transactionId
        amount
        paidAt
      }
      subtotal
      deliveryCharge
      discount
      totalAmount
      orderStatus
      trackingNumber
      deliveredAt
      cancelledAt
      cancellationReason
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      _id
      orderId
      orderStatus
      trackingNumber
      updatedAt
    }
  }
`
