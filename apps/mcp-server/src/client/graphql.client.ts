import { GraphQLClient } from 'graphql-request';
import { env } from '../config/env.config.js';

const buildCookie = (sessionId: string) =>
    `guest_session=${JSON.stringify({ sessionId })}`;

export const graphqlClient = new GraphQLClient(env.backendGraphqlUrl, {
    headers: {
        Cookie: buildCookie(env.guestSessionId),
    },
});

export function setGuestSession(sessionId: string): void {
    graphqlClient.setHeader('Cookie', buildCookie(sessionId));
}
