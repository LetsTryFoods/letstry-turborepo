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
      id
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
      id
      name
      variants {
        id
        sku
        gtin
        name
        stockQuantity
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
      id
      sku
      changeAmount
      previousStock
      newStock
      actionType
      createdAt
    }
  }
`;
