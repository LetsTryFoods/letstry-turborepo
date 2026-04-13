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
          phone
        }
        items {
          name
          quantity
        }
        payment {
          _id
          status
          method
        }
        totalAmount
        discount
        orderStatus
        createdAt
        updatedAt
        shipment {
          dtdcAwbNumber
        }
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
          shipmentFailed
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
      estimatedWeight
      boxDimensions {
        l
        w
        h
      }
      shipment {
        dtdcAwbNumber
      }
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

export const ADMIN_PUNCH_SHIPMENT = gql`
  mutation AdminPunchShipment($input: AdminPunchShipmentInput!) {
    adminPunchShipment(input: $input) {
      id
      orderId
      status
    }
  }
`
