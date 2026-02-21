import { gql } from '@apollo/client'

export const GET_ALL_SHIPMENTS = gql`
  query ListShipments($filters: ShipmentFiltersInput) {
    listShipments(filters: $filters) {
      success
      shipments {
        id
        orderId
        dtdcAwbNumber
        dtdcReferenceNumber
        customerCode
        serviceType
        loadType
        originCity
        destinationCity
        weight
        declaredValue
        bookedOn
        expectedDeliveryDate
        revisedExpectedDeliveryDate
        rtoNumber
        currentStatusCode
        currentStatusDescription
        currentLocation
        isDelivered
        deliveredAt
        isRto
        isCancelled
        cancelledAt
        labelUrl
        codAmount
        codCollectionMode
        dimensions
        originDetails
        destinationDetails
        invoiceNumber
        invoiceDate
        ewayBill
        commodityId
        numPieces
        piecesDetail
        webhookLastReceivedAt
        createdAt
        updatedAt
        trackingLink
      }
      total
    }
  }
`

export const GET_SHIPMENT_BY_ID = gql`
  query GetShipmentById($id: ID!) {
    getShipmentById(id: $id) {
      id
      orderId
      dtdcAwbNumber
      dtdcReferenceNumber
      customerCode
      serviceType
      loadType
      originCity
      destinationCity
      weight
      declaredValue
      bookedOn
      expectedDeliveryDate
      revisedExpectedDeliveryDate
      rtoNumber
      currentStatusCode
      currentStatusDescription
      currentLocation
      isDelivered
      deliveredAt
      isRto
      isCancelled
      cancelledAt
      labelUrl
      codAmount
      codCollectionMode
      dimensions
      originDetails
      destinationDetails
      invoiceNumber
      invoiceDate
      ewayBill
      commodityId
      numPieces
      piecesDetail
      webhookLastReceivedAt
      createdAt
      updatedAt
      trackingLink
    }
  }
`

export const GET_SHIPMENT_BY_AWB = gql`
  query GetShipmentByAwb($awbNumber: String!) {
    getShipmentByAwb(awbNumber: $awbNumber) {
      id
      orderId
      dtdcAwbNumber
      dtdcReferenceNumber
      customerCode
      serviceType
      loadType
      originCity
      destinationCity
      weight
      declaredValue
      bookedOn
      expectedDeliveryDate
      revisedExpectedDeliveryDate
      rtoNumber
      currentStatusCode
      currentStatusDescription
      currentLocation
      isDelivered
      deliveredAt
      isRto
      isCancelled
      cancelledAt
      labelUrl
      codAmount
      codCollectionMode
      dimensions
      originDetails
      destinationDetails
      invoiceNumber
      invoiceDate
      ewayBill
      commodityId
      numPieces
      piecesDetail
      webhookLastReceivedAt
      createdAt
      updatedAt
      trackingLink
    }
  }
`

export const GET_SHIPMENT_WITH_TRACKING = gql`
  query GetShipmentWithTracking($awbNumber: String!) {
    getShipmentWithTracking(awbNumber: $awbNumber) {
      id
      orderId
      dtdcAwbNumber
      dtdcReferenceNumber
      customerCode
      serviceType
      loadType
      originCity
      destinationCity
      weight
      declaredValue
      bookedOn
      expectedDeliveryDate
      revisedExpectedDeliveryDate
      rtoNumber
      currentStatusCode
      currentStatusDescription
      currentLocation
      isDelivered
      deliveredAt
      isRto
      isCancelled
      cancelledAt
      labelUrl
      codAmount
      codCollectionMode
      dimensions
      originDetails
      destinationDetails
      invoiceNumber
      invoiceDate
      ewayBill
      commodityId
      numPieces
      piecesDetail
      webhookLastReceivedAt
      createdAt
      updatedAt
      trackingLink
      trackingHistory {
        id
        shipmentId
        statusCode
        statusDescription
        location
        manifestNumber
        actionDate
        actionTime
        actionDatetime
        remarks
        latitude
        longitude
        scdOtp
        ndcOtp
        createdAt
      }
    }
  }
`

export const CANCEL_SHIPMENT = gql`
  mutation CancelShipment($input: CancelShipmentInput!) {
    cancelShipment(input: $input) {
      id
      dtdcAwbNumber
      currentStatusCode
      isCancelled
      cancelledAt
    }
  }
`

export const GET_SHIPMENT_LABEL = gql`
  query GetShipmentLabel($awbNumber: String!) {
    getShipmentLabel(awbNumber: $awbNumber)
  }
`
