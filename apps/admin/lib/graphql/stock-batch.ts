import { gql } from '@apollo/client';

export const GET_EXPIRING_BATCHES = gql`
  query GetExpiringBatches($withinDays: Int) {
    expiringBatches(withinDays: $withinDays) {
      _id
      sku
      batchNumber
      expiryDate
      quantityRemaining
      status
      isOnSale
      purchaseOrderId
    }
  }
`;

export const GET_STOCK_BATCHES_BY_SKU = gql`
  query GetStockBatchesBySku($sku: String!) {
    stockBatchesBySku(sku: $sku) {
      _id
      sku
      batchNumber
      expiryDate
      manufactureDate
      quantityReceived
      quantityRemaining
      perUnitCost
      status
      isOnSale
      purchaseOrderId
      receivedBy
      createdAt
    }
  }
`;

export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders($page: Int, $limit: Int) {
    purchaseOrders(page: $page, limit: $limit) {
      _id
      billNumber
      billDate
      vendorName
      totalAmount
      billImageUrls
      status
      receivedBy
      createdAt
    }
  }
`;

export const RUN_EXPIRY_CHECK = gql`
  mutation RunExpiryCheck {
    runExpiryCheck
  }
`;
