import { graphqlClient } from '../../client/graphql.client.js';
import {
    GET_MY_ORDERS_QUERY,
    GET_ORDER_BY_ID_QUERY,
    CANCEL_ORDER_MUTATION,
} from './order.queries.js';

export async function getMyOrders(page: number, limit: number, status?: string): Promise<unknown> {
    return graphqlClient.request(GET_MY_ORDERS_QUERY, {
        input: { page, limit, ...(status ? { status } : {}) },
    });
}

export async function getOrderById(orderId: string): Promise<unknown> {
    return graphqlClient.request(GET_ORDER_BY_ID_QUERY, { orderId });
}

export async function cancelOrder(orderId: string, reason: string): Promise<unknown> {
    return graphqlClient.request(CANCEL_ORDER_MUTATION, {
        input: { orderId, reason },
    });
}
