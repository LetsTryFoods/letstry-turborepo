import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

process.stderr.write(`[MCP] BACKEND_GRAPHQL_URL=${process.env.BACKEND_GRAPHQL_URL}\n`);
process.stderr.write(`[MCP] GUEST_SESSION_ID=${process.env.GUEST_SESSION_ID}\n`);

const { createServer } = await import('./server.js');
const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');

const server = createServer();
const transport = new StdioServerTransport();

await server.connect(transport);
