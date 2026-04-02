import { gql } from '@apollo/client';


export const GET_MY_CART = gql`
  query GetMyCart {
    myCart {
      _id
      status
      couponCode
      items {
        productId
        variantId
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
`;

export const ADD_TO_CART = gql`
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
        shippingCost
        estimatedTax
        handlingCharge
        grandTotal
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      _id
      items {
        productId
        quantity
        totalPrice
      }
      totalsSummary {
        subtotal
        discountAmount
        shippingCost
        estimatedTax
        handlingCharge
        grandTotal
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      _id
      items {
        productId
        name
        quantity
      }
      totalsSummary {
        subtotal
        discountAmount
        shippingCost
        estimatedTax
        handlingCharge
        grandTotal
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      _id
      items {
        productId
      }
      totalsSummary {
        subtotal
        discountAmount
        shippingCost
        estimatedTax
        handlingCharge
        grandTotal
      }
    }
  }
`;

export const APPLY_COUPON = gql`
  mutation ApplyCoupon($code: String!) {
    applyCoupon(code: $code) {
      _id
      couponCode
      totalsSummary {
        subtotal
        discountAmount
        shippingCost
        estimatedTax
        handlingCharge
        grandTotal
      }
    }
  }
`;

export const REMOVE_COUPON = gql`
  mutation RemoveCoupon {
    removeCoupon {
      _id
      couponCode
      totalsSummary {
        subtotal
        discountAmount
        shippingCost
        estimatedTax
        handlingCharge
        grandTotal
      }
    }
  }
`;

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress($input: SetShippingAddressInput!) {
    setShippingAddress(input: $input) {
      _id
      shippingAddressId
      totalsSummary {
        subtotal
        discountAmount
        shippingCost
        estimatedTax
        handlingCharge
        grandTotal
      }
    }
  }
`;
