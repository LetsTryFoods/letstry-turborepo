import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSearchProductsTool } from './tools/products/search-products.tool.js';
import { registerCartTools } from './tools/cart/cart.tool.js';
import { registerOrderTools } from './tools/order/order.tool.js';
import { registerAddressTool } from './tools/address/address.tool.js';
import { registerGuestSessionTool } from './tools/guest-session/guest-session.tool.js';
import { registerPaymentTools } from './tools/payment/payment.tool.js';

export function createServer(): McpServer {
    const server = new McpServer({
        name: 'letstry-foods',
        version: '0.1.0',
    });

    registerSearchProductsTool(server);
    registerCartTools(server);
    registerOrderTools(server);
    registerAddressTool(server);
    registerGuestSessionTool(server);
    registerPaymentTools(server);

    return server;
}
