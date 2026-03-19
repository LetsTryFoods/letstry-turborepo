import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getMyOrders, getOrderById, cancelOrder } from './order.service.js';

export function registerOrderTools(server: McpServer): void {
    server.tool(
        'get_my_orders',
        'Get the list of orders placed by the current user. Supports pagination and filtering by status.',
        {
            page: z.number().int().min(1).default(1).describe('Page number'),
            limit: z.number().int().min(1).max(20).default(10).describe('Orders per page'),
            status: z.string().optional().describe('Filter by order status (e.g. PENDING, CONFIRMED, DELIVERED, CANCELLED)'),
        },
        async ({ page, limit, status }) => {
            const result = await getMyOrders(page, limit, status);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'get_order_by_id',
        'Get detailed information about a specific order by its order ID.',
        {
            orderId: z.string().describe('The order ID to look up'),
        },
        async ({ orderId }) => {
            const result = await getOrderById(orderId);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool(
        'cancel_order',
        'Cancel an existing order. Only orders that have not been shipped can be cancelled.',
        {
            orderId: z.string().describe('The order ID to cancel'),
            reason: z.string().describe('Reason for cancellation'),
        },
        async ({ orderId, reason }) => {
            const result = await cancelOrder(orderId, reason);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );
}
