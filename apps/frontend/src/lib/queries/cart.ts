import { graphql } from '@/gql';

export const GET_MY_CART = graphql(`
  query GetMyCart {
    myCart {
      _id
      status
      couponCode
      items {
        productId
        sku
        name
        quantity
        unitPrice
        totalPrice
        mrp
        imageUrl
        attributes
      }
      totalsSummary {
        subtotal
        discountAmount
        shippingCost
        estimatedTax
        handlingCharge
        grandTotal
      }
      createdAt
      updatedAt
    }
  }
`);

export const ADD_TO_CART = graphql(`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      _id
      items {
        productId
        name
        quantity
        unitPrice
        totalPrice
        attributes
      }
      totalsSummary {
        subtotal
        discountAmount
        grandTotal
      }
    }
  }
`);

export const UPDATE_CART_ITEM = graphql(`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      _id
      items {
        productId
        quantity
        totalPrice
      }
      totalsSummary {
        grandTotal
      }
    }
  }
`);

export const REMOVE_FROM_CART = graphql(`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      _id
      items {
        productId
        name
        quantity
      }
      totalsSummary {
        grandTotal
      }
    }
  }
`);
