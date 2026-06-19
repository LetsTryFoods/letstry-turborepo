import { gql } from '@apollo/client';

/* ====================================================
   1. AUTHENTICATION & DASHBOARD
   ==================================================== */

export const PACKER_LOGIN = gql`
  mutation PackerLogin($input: PackerLoginInput!) {
    packerLogin(input: $input) {
      accessToken
      packer {
        id
        name
        isActive  # ✅ FIXED: Replaced 'status' with schema-correct field
        # role    # ❌ REMOVED: Field does not exist on Packer type
      }
    }
  }
`;

export const GET_MY_ASSIGNED_ORDERS = gql`
  query GetMyAssignedOrders {
    getMyAssignedOrders {
      id
      orderId
      orderNumber
      status
      specialInstructions
      isExpress
      shippingInfo {
        recipientName
        addressLine1
        city
        pincode
        recipientPhone
      }
      items {
        productId
        quantity
      }
    }
  }
`;

export const MARK_ITEM_SHORT = gql`
  mutation MarkItemShort($packingOrderId: String!, $productId: String!, $shortQty: Int!, $isComponent: Boolean) {
    markItemShort(packingOrderId: $packingOrderId, productId: $productId, shortQty: $shortQty, isComponent: $isComponent) {
      id
      orderId
    }
  }
`;

export const GET_MY_HISTORY = gql`
  query GetMyHistory {
    getMyOrderHistory {
      id
      orderId
      orderNumber
      status
      packingCompletedAt
      isExpress
      shippingInfo {
        recipientName
        addressLine1
        city
        pincode
        recipientPhone
      }
      items {
        productId
        quantity
      }
      evidence {
        prePackImages
      }
    }
  }
`;

export const GET_MY_STATS = gql`
  query GetMyStats {
    getMyStats {
      packerId
      totalOrders
      accuracyRate
      averagePackTime
      ordersPackedToday
    }
  }
`;

export const GET_EVIDENCE_BY_ORDER = gql`
  query GetEvidenceByOrder($packingOrderId: String!) {
    getEvidenceByOrder(packingOrderId: $packingOrderId) {
      id
      prePackImages
      actualBox {
        code
      }
    }
  }
`;

// export const GET_ORDER_DETAILS = gql`
//   query GetOrderDetails($packingOrderId: String!) {
//     getPackingOrder(id: $packingOrderId) {
//       id
//       orderId
//       orderNumber
//       status
//       specialInstructions
//       isExpress
//       items {
//         productId
//         sku
//         ean
//         name
//         quantity
//         scannedCount
//         shortCount
//         shortComponentCount
//         unitPrice
//         dimensions {
//           weight
//           unit
//         }
//         imageUrl
//         isFragile
//       }
//     }
//   }
// `;

/* ====================================================
   2. PACKING FLOW MUTATIONS
   ==================================================== */

export const START_PACKING = gql`
  mutation StartPacking($packingOrderId: String!) {
    startPacking(packingOrderId: $packingOrderId) {
      id
      status
      packingStartedAt
    }
  }
`;

export const SCAN_ITEM = gql`
  mutation ScanItem($input: ScanItemInput!) {
    scanItem(input: $input) {
      id
      packingOrderId
      packerId
      ean
      scannedAt
      isValid
      errorType
      matchedProductId
      matchedSku
      expectedQuantity
      scannedQuantity
      isRetrospective
      flaggedBy
    }
  }
`;

export const BATCH_SCAN_ITEMS = gql`
  mutation BatchScanItems($input: BatchScanInput!) {
    batchScanItems(input: $input) {
      success
      totalProcessed
      successCount
      failureCount
      errorMessage
      validations {
        productId
        isValid
        errorType
        errorMessage
        expectedQuantity
        scannedQuantity
        productName
      }
    }
  }
`;

export const UPLOAD_EVIDENCE = gql`
  mutation UploadEvidence($input: UploadEvidenceInput!) {
    uploadEvidence(input: $input) {
      id
      status
    }
  }
`;

export const GET_DELIVERY_RECOMMENDATION = gql`
  query GetDeliveryRecommendation($orderId: String!) {
    getDeliveryRecommendation(orderId: $orderId) {
      recommendedProvider
      reason
    }
  }
`;

export const COMPLETE_PACKING = gql`
  mutation CompletePacking($packingOrderId: String!, $provider: String, $serviceType: String) {
    completePacking(packingOrderId: $packingOrderId, provider: $provider, serviceType: $serviceType) {
      id
      status
      packingCompletedAt
    }
  }
`;

export const ADMIN_PUNCH_SHIPMENT = gql`
  mutation AdminPunchShipment($input: AdminPunchShipmentInput!) {
    adminPunchShipment(input: $input) {
      id
      status
      shipmentInfo {
        awbNumber
        provider
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($searchTerm: String!) {
    searchProducts(searchTerm: $searchTerm, pagination: { page: 1, limit: 20 }) {
      items {
        _id
        name
        variants {
          _id
          sku
          stockQuantity
          thumbnailUrl
        }
      }
    }
  }
`;

export const GET_GLOBAL_SETTINGS = gql`
  query GetGlobalSettings {
    getGlobalSettings {
      _id
      isPackerScanBypassEnabled
    }
  }
`;

export const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: String!) {
    getPackingOrder(id: $id) {
      id
      orderId
      orderNumber
      status
      specialInstructions
      isExpress
      packingCompletedAt
      shippingInfo {
        recipientName
        recipientPhone
        addressLine1
        addressLine2
        city
        pincode
        state
      }
      shipmentInfo {
        awbNumber
        provider
      }
      items {
        productId
        sku
        ean
        name
        quantity
        scannedCount
        shortCount
        shortComponentCount
        unitPrice
        dimensions {
          length
          width
          height
          weight
          unit
        }
        isFragile
        imageUrl
      }
      evidence {
        prePackImages
      }
      boxId
      volumetricWeight
      region
      logisticsCost
    }
  }
`;

export const GET_ACTIVE_BOX_SIZES = gql`
  query GetActiveBoxSizes {
    getActiveBoxSizes {
      id
      code
      name
      lengthCm
      breadthCm
      heightCm
      lengthInches
      breadthInches
      heightInches
      maxWeight
    }
  }
`;

export const ASSIGN_BOX_TO_ORDER = gql`
  mutation AssignBoxToOrder($input: AssignBoxToOrderInput!) {
    assignBoxToOrder(input: $input) {
      _id
      boxId
      volumetricWeight
      region
      logisticsCost
    }
  }
`;
