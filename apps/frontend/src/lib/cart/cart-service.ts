import { graphqlClient } from '@/lib/graphql/client-factory';
import { ADD_TO_CART, UPDATE_CART_ITEM, REMOVE_FROM_CART, SET_SHIPPING_ADDRESS } from '@/lib/queries/cart';

export const CartService = {
  addToCart: async (productId: string, quantity: number, attributes?: Record<string, any>) => {
    const input: any = {
      productId,
      quantity,
    };
    
    if (attributes !== undefined && attributes !== null) {
      input.attributes = attributes;
    }
    
    return await graphqlClient.request(ADD_TO_CART.toString(), {
      input,
    });
  },

  updateCartItem: async (productId: string, quantity: number) => {
    return await graphqlClient.request(UPDATE_CART_ITEM.toString(), {
      input: {
        productId,
        quantity,
      },
    });
  },

  removeFromCart: async (productId: string) => {
    return await graphqlClient.request(REMOVE_FROM_CART.toString(), {
      productId,
    });
  },

  setShippingAddress: async (addressId: string) => {
    return await graphqlClient.request(SET_SHIPPING_ADDRESS, {
      input: {
        addressId,
      },
    });
  },
};
