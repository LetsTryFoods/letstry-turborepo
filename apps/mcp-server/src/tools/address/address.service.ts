import { graphqlClient } from '../../client/graphql.client.js';
import { MY_ADDRESSES_QUERY } from './address.queries.js';

export async function getMyAddresses(): Promise<unknown> {
    return graphqlClient.request(MY_ADDRESSES_QUERY);
}
