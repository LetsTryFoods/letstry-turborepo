import { gql } from 'graphql-request';

export const MY_CART_QUERY = gql`
  query MyCart {
    myCart {
      _id
      items {
        productId
        quantity
        attributes
      }
      couponCode
      shippingAddressId
    }
  }
`;

export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      _id
      items {
        productId
        quantity
        attributes
      }
      couponCode
      shippingAddressId
    }
  }
`;

export const UPDATE_CART_ITEM_MUTATION = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      _id
      items {
        productId
        quantity
      }
      couponCode
      shippingAddressId
    }
  }
`;

export const REMOVE_FROM_CART_MUTATION = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      _id
      items {
        productId
        quantity
      }
    }
  }
`;

export const CLEAR_CART_MUTATION = gql`
  mutation ClearCart {
    clearCart {
      _id
      items {
        productId
        quantity
      }
    }
  }
`;

export const APPLY_COUPON_MUTATION = gql`
  mutation ApplyCoupon($code: String!) {
    applyCoupon(code: $code) {
      _id
      items {
        productId
        quantity
      }
      couponCode
    }
  }
`;

export const REMOVE_COUPON_MUTATION = gql`
  mutation RemoveCoupon {
    removeCoupon {
      _id
      items {
        productId
        quantity
      }
      couponCode
    }
  }
`;

export const SET_SHIPPING_ADDRESS_MUTATION = gql`
  mutation SetShippingAddress($input: SetShippingAddressInput!) {
    setShippingAddress(input: $input) {
      _id
      items {
        productId
        quantity
      }
      shippingAddressId
    }
  }
`;
