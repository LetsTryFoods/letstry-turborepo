import { graphqlClient } from '../../client/graphql.client.js';
import {
    MY_CART_QUERY,
    ADD_TO_CART_MUTATION,
    UPDATE_CART_ITEM_MUTATION,
    REMOVE_FROM_CART_MUTATION,
    CLEAR_CART_MUTATION,
    APPLY_COUPON_MUTATION,
    REMOVE_COUPON_MUTATION,
    SET_SHIPPING_ADDRESS_MUTATION,
} from './cart.queries.js';

export async function getMyCart(): Promise<unknown> {
    return graphqlClient.request(MY_CART_QUERY);
}

export async function addToCart(productId: string, quantity: number, attributes?: unknown): Promise<unknown> {
    return graphqlClient.request(ADD_TO_CART_MUTATION, {
        input: { productId, quantity, attributes },
    });
}

export async function updateCartItem(productId: string, quantity: number): Promise<unknown> {
    return graphqlClient.request(UPDATE_CART_ITEM_MUTATION, {
        input: { productId, quantity },
    });
}

export async function removeFromCart(productId: string): Promise<unknown> {
    return graphqlClient.request(REMOVE_FROM_CART_MUTATION, { productId });
}

export async function clearCart(): Promise<unknown> {
    return graphqlClient.request(CLEAR_CART_MUTATION);
}

export async function applyCoupon(code: string): Promise<unknown> {
    return graphqlClient.request(APPLY_COUPON_MUTATION, { code });
}

export async function removeCoupon(): Promise<unknown> {
    return graphqlClient.request(REMOVE_COUPON_MUTATION);
}

export async function setShippingAddress(addressId: string): Promise<unknown> {
    return graphqlClient.request(SET_SHIPPING_ADDRESS_MUTATION, {
        input: { addressId },
    });
}
