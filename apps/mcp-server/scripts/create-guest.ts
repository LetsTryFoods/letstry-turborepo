/// <reference types="node" />

const GRAPHQL_URL = process.env.BACKEND_GRAPHQL_URL ?? 'https://apiv3.letstryfoods.com/graphql';

async function gql(query: string): Promise<any> {
    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    const json = await res.json() as { data?: any; errors?: any[] };
    if (json.errors) throw new Error(json.errors.map((e: any) => e.message).join(', '));
    return json.data;
}

async function main() {
    const data = await gql(`
    mutation {
      createGuest(input: {}) {
        sessionId
        guestId
      }
    }
  `);

    const { sessionId, guestId } = data.createGuest;

    console.log('\n✅ Guest session created!\n');
    console.log(`guestId:   ${guestId}`);
    console.log(`sessionId: ${sessionId}`);
    console.log('\nAdd this to apps/mcp-server/.env:');
    console.log(`\nGUEST_SESSION_ID=${sessionId}\n`);
}

main().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
