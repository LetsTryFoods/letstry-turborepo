import { graphqlClient, setGuestSession } from '../../client/graphql.client.js';
import { CREATE_GUEST_MUTATION } from './guest-session.query.js';

interface GuestSessionResult {
    sessionId: string;
    guestId: string;
}

export async function createGuestSession(): Promise<GuestSessionResult> {
    const data = await graphqlClient.request<{ createGuest: GuestSessionResult }>(
        CREATE_GUEST_MUTATION,
    );
    const { sessionId, guestId } = data.createGuest;
    setGuestSession(sessionId);
    return { sessionId, guestId };
}
