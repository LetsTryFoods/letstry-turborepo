import { gql } from "@apollo/client";

export const GET_ASSIGNED_ORDER = gql`
  query GetAssignedOrder {
    getAssignedOrder {
      id
      orderId
      assignedTo
      status
      items {
        ean
        productName
        quantity
        scannedQuantity
        imageUrl
      }
      recommendedBoxCode
      actualBoxCode
      packingStartedAt
      packingCompletedAt
      prePackImages
      retrospectiveErrors {
        errorType
        description
        flaggedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_BOX_RECOMMENDATION = gql`
  query GetBoxRecommendation($packingOrderId: String!) {
    getBoxRecommendation(packingOrderId: $packingOrderId) {
      id
      code
      name
      length
      width
      height
      maxWeight
      volumetricWeight
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_PACKING_ORDERS = gql`
  query GetAllPackingOrders($packerId: String, $status: String) {
    getAllPackingOrders(packerId: $packerId, status: $status) {
      id
      orderId
      orderNumber
      status
      priority
      assignedTo
      packerName
      assignedAt
      items {
        productId
        sku
        ean
        name
        quantity
      }
      hasErrors
      packingStartedAt
      packingCompletedAt
      estimatedPackTime
      specialInstructions
      isExpress
    }
  }
`;

export const GET_EVIDENCE_BY_ORDER = gql`
  query GetEvidenceByOrder($packingOrderId: String!) {
    getEvidenceByOrder(packingOrderId: $packingOrderId) {
      id
      packingOrderId
      packerId
      prePackImages
      postPackImages
      recommendedBox {
        code
        dimensions {
          l
          w
          h
        }
      }
      actualBox {
        code
        dimensions {
          l
          w
          h
        }
      }
      boxMismatch
      dimensionConfidence
      uploadedAt
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
      action
      timestamp
      isError
      errorType
    }
  }
`;

export const UPLOAD_EVIDENCE = gql`
  mutation UploadEvidence($input: UploadEvidenceInput!) {
    uploadEvidence(input: $input) {
      id
      orderId
      assignedTo
      status
      items {
        ean
        productName
        quantity
        scannedQuantity
        imageUrl
      }
      recommendedBoxCode
      actualBoxCode
      packingStartedAt
      packingCompletedAt
      prePackImages
      createdAt
      updatedAt
    }
  }
`;

export const COMPLETE_PACKING = gql`
  mutation CompletePacking($packingOrderId: String!) {
    completePacking(packingOrderId: $packingOrderId) {
      id
      orderId
      assignedTo
      status
      packingCompletedAt
      createdAt
      updatedAt
    }
  }
`;

export const START_PACKING = gql`
  mutation StartPacking($packingOrderId: String!) {
    startPacking(packingOrderId: $packingOrderId) {
      id
      orderId
      orderNumber
      status
      priority
      assignedTo
      assignedAt
      items {
        productId
        sku
        ean
        name
        quantity
      }
      hasErrors
      packingStartedAt
      packingCompletedAt
      estimatedPackTime
      specialInstructions
      isExpress
    }
  }
`;

export const FLAG_PACKING_ERROR = gql`
  mutation FlagPackingError($input: FlagErrorInput!) {
    flagPackingError(input: $input) {
      id
      packingOrderId
      packerId
      ean
      action
      timestamp
      isError
      errorType
    }
  }
`;

export const CLEANUP_ORPHANED_JOBS = gql`
  mutation CleanupOrphanedJobs {
    cleanupOrphanedJobs {
      removed
      checked
    }
  }
`;
