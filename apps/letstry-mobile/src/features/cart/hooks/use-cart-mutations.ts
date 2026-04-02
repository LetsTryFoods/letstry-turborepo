import { useMutation } from '@apollo/client';
import {
  ADD_TO_CART,
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  CLEAR_CART,
  APPLY_COUPON,
  REMOVE_COUPON,
  GET_MY_CART,
} from '../../../lib/graphql/cart';

export const useCartMutations = () => {
  // We use refetchQueries explicitly to ensure the cart total summary is updated properly
  const refetchOptions = [{ query: GET_MY_CART }];

  const [addToCart, { loading: isAdding }] = useMutation(ADD_TO_CART, {
    refetchQueries: refetchOptions,
  });

  const [updateCartItem, { loading: isUpdating }] = useMutation(UPDATE_CART_ITEM, {
    refetchQueries: refetchOptions,
  });

  const [removeFromCart, { loading: isRemoving }] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: refetchOptions,
  });

  const [clearCart, { loading: isClearing }] = useMutation(CLEAR_CART, {
    refetchQueries: refetchOptions,
  });

  const [applyCoupon, { loading: isApplyingCoupon }] = useMutation(APPLY_COUPON, {
    refetchQueries: refetchOptions,
  });

  const [removeCoupon, { loading: isRemovingCoupon }] = useMutation(REMOVE_COUPON, {
    refetchQueries: refetchOptions,
  });

  return {
    addToCart,
    isAdding,
    updateCartItem,
    isUpdating,
    removeFromCart,
    isRemoving,
    clearCart,
    isClearing,
    applyCoupon,
    isApplyingCoupon,
    removeCoupon,
    isRemovingCoupon,
  };
};
