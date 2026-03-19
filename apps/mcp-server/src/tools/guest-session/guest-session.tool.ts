import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createGuestSession } from './guest-session.service.js';

export function registerGuestSessionTool(server: McpServer): void {
    server.tool(
        'create_guest_session',
        'Creates a new guest session and refreshes the active connection. Call this tool whenever you encounter an authentication or session error from any other tool.',
        {},
        async () => {
            const { sessionId, guestId } = await createGuestSession();
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ success: true, guestId, sessionId }, null, 2),
                    },
                ],
            };
        },
    );
}
