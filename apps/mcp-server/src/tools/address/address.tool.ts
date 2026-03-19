import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getMyAddresses } from './address.service.js';

export function registerAddressTool(server: McpServer): void {
    server.tool(
        'list_addresses',
        'List all saved shipping addresses for the current user. Use the returned _id to set a shipping address on the cart.',
        {},
        async () => {
            const result = await getMyAddresses();
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );
}
