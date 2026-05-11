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
        totalCount
        page
        limit
        totalPages
      }
    }
  }
`;

/** Mobile-app-only query for guest users (protected by x-mobile-key header). */
export const GET_GUEST_ORDERS = gql`
  query GetGuestOrders($input: GetMyOrdersInput!) {
    getGuestOrders(input: $input) {
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
        totalCount
        page
        limit
        totalPages
      }
    }
  }
`;

export const GET_GUEST_ORDER_BY_ID = gql`
  query GetGuestOrderById($orderId: String!) {
    getGuestOrderById(orderId: $orderId) {
      _id
      orderId
      totalAmount
      subtotal
      discount
      deliveryCharge
      orderStatus
      createdAt
      trackingNumber
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
      shipment {
        dtdcAwbNumber
        currentStatusCode
        currentStatusDescription
        currentLocation
        expectedDeliveryDate
        revisedExpectedDeliveryDate
        originCity
        destinationCity
        isDelivered
        deliveredAt
        trackingLink
        bookedOn
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
      trackingNumber
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
      shipment {
        dtdcAwbNumber
        currentStatusCode
        currentStatusDescription
        currentLocation
        expectedDeliveryDate
        revisedExpectedDeliveryDate
        originCity
        destinationCity
        isDelivered
        deliveredAt
        trackingLink
        bookedOn
      }
    }
  }
`;

export const GET_SHIPMENT_TRACKING = gql`
  query GetShipmentWithTracking($awbNumber: String!) {
    getShipmentWithTracking(awbNumber: $awbNumber) {
      dtdcAwbNumber
      currentStatusCode
      currentStatusDescription
      currentLocation
      expectedDeliveryDate
      isDelivered
      trackingHistory {
        statusCode
        statusDescription
        location
        actionDatetime
        remarks
      }
    }
  }
`;

export const GET_GUEST_SHIPMENT_TRACKING = gql`
  query GetGuestShipmentWithTracking($awbNumber: String!) {
    getGuestShipmentWithTracking(awbNumber: $awbNumber) {
      dtdcAwbNumber
      currentStatusCode
      currentStatusDescription
      currentLocation
      expectedDeliveryDate
      isDelivered
      trackingHistory {
        statusCode
        statusDescription
        location
        actionDatetime
        remarks
      }
    }
  }
`;

