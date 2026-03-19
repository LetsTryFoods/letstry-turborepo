import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { initiatePayment, getPaymentStatus } from './payment.service.js';

export function registerPaymentTools(server: McpServer): void {
    server.tool(
        'initiate_payment',
        'Start the payment process for the current cart. Returns a redirectUrl that the user must open in their browser to complete payment. After the user completes payment, call check_payment_status to confirm.',
        {
            cartId: z.string().describe('The cart _id to initiate payment for. Get this from view_cart.'),
        },
        async ({ cartId }) => {
            const result = await initiatePayment(cartId);
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        },
    );

    server.tool(
        'check_payment_status',
        'Check the current status of a payment. Call this after the user has completed payment on the redirectUrl. Status will be SUCCESS, PENDING, or FAILED.',
        {
            paymentOrderId: z.string().describe('The paymentOrderId returned by initiate_payment.'),
        },
        async ({ paymentOrderId }) => {
            const result = await getPaymentStatus(paymentOrderId);
            return {
                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
        },
    );
}
