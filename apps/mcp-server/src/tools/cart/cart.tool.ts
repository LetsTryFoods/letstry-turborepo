import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
    getMyCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    setShippingAddress,
} from './cart.service.js';

export function registerCartTools(server: McpServer): void {
    server.tool(
        'view_cart',
        'View the current cart contents including items, quantities, applied coupon, and shipping address.',
        {},
        async () => {
            const result = await getMyCart();
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'add_to_cart',
        'Add a product to the cart. Use the productId from search_products results.',
        {
            productId: z.string().describe('The product ID to add to cart'),
            quantity: z.number().int().min(1).max(10).describe('Quantity to add'),
        },
        async ({ productId, quantity }) => {
            const result = await addToCart(productId, quantity);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'update_cart_item',
        'Update the quantity of an existing item in the cart. Set quantity to 0 to remove it.',
        {
            productId: z.string().describe('The product ID to update'),
            quantity: z.number().int().min(0).max(10).describe('New quantity (0 removes the item)'),
        },
        async ({ productId, quantity }) => {
            const result = await updateCartItem(productId, quantity);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'remove_from_cart',
        'Remove a specific product from the cart.',
        {
            productId: z.string().describe('The product ID to remove from cart'),
        },
        async ({ productId }) => {
            const result = await removeFromCart(productId);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'clear_cart',
        'Remove all items from the cart.',
        {},
        async () => {
            const result = await clearCart();
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'apply_coupon',
        'Apply a discount coupon code to the cart.',
        {
            code: z.string().describe('The coupon code to apply'),
        },
        async ({ code }) => {
            const result = await applyCoupon(code);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'remove_coupon',
        'Remove the currently applied coupon from the cart.',
        {},
        async () => {
            const result = await removeCoupon();
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'set_shipping_address',
        'Set the shipping address for the cart. Use list_addresses to get available address IDs.',
        {
            addressId: z.string().describe('The address ID to use for shipping'),
        },
        async ({ addressId }) => {
            const result = await setShippingAddress(addressId);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );
}
