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
      items {
        productId
        sku
        ean
        name
        quantity
        imageUrl
        isFragile
      }
    }
  }
`;

export const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($packingOrderId: String!) {
    getPackingOrder(id: $packingOrderId) {
      id
      orderId
      orderNumber
      status
      items {
        productId
        sku
        ean
        name
        quantity
        scannedCount
        imageUrl
        isFragile
      }
    }
  }
`;

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

export const COMPLETE_PACKING = gql`
  mutation CompletePacking($packingOrderId: String!) {
    completePacking(packingOrderId: $packingOrderId) {
      id
      status
      packingCompletedAt
    }
  }
`;