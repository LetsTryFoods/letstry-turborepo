import { gql } from '@apollo/client';

export const ADJUST_INVENTORY = gql`
  mutation AdjustInventory(
    $identifier: String!, 
    $incrementBy: Int!, 
    $reason: String,
    $performedBy: String
  ) {
    adjustInventory(
      identifier: $identifier, 
      incrementBy: $incrementBy, 
      reason: $reason,
      performedBy: $performedBy
    ) {
      _id
      sku
      changeAmount
      previousStock
      newStock
      actionType
      createdAt
    }
  }
`;

export const FIND_PRODUCT_BY_IDENTIFIER = gql`
  query FindProductByIdentifier($identifier: String!) {
    findProductByIdentifier(identifier: $identifier) {
      _id
      name
      variants {
        _id
        sku
        gtin
        name
        stockQuantity
        availabilityStatus
        weight
        weightUnit
        thumbnailUrl
      }
    }
  }
`;

export const SET_INVENTORY = gql`
  mutation SetInventory($identifier: String!, $newStockLevel: Int!, $performedBy: String) {
    setInventory(identifier: $identifier, newStockLevel: $newStockLevel, performedBy: $performedBy) {
      _id
      sku
      changeAmount
      previousStock
      newStock
      actionType
      createdAt
    }
  }
`;

/**
 * recordStockInward — use this for NEW STOCK ARRIVALS (scan to add stock).
 * Records as INWARD action type with vendor / PO reference metadata.
 * availabilityStatus is auto-synced to 'in_stock' when stock becomes > 0.
 */
export const RECORD_STOCK_INWARD = gql`
  mutation RecordStockInward(
    $identifier: String!
    $quantityAdded: Int!
    $vendor: String
    $purchaseOrderRef: String
    $performedBy: String
    $notes: String
  ) {
    recordStockInward(
      identifier: $identifier
      quantityAdded: $quantityAdded
      vendor: $vendor
      purchaseOrderRef: $purchaseOrderRef
      performedBy: $performedBy
      notes: $notes
    ) {
      _id
      sku
      changeAmount
      previousStock
      newStock
      actionType
      vendor
      notes
      createdAt
    }
  }
`;

export const INVENTORY_SNAPSHOT = gql`
  query InventorySnapshot($identifier: String!) {
    inventorySnapshot(identifier: $identifier) {
      sku
      stockQuantity
      availabilityStatus
      recentLogs {
        _id
        changeAmount
        previousStock
        newStock
        actionType
        vendor
        notes
        performedBy
        createdAt
      }
    }
  }
`;
