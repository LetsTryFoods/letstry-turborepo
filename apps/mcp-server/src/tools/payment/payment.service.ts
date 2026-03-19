import { graphqlClient } from '../../client/graphql.client.js';
import { INITIATE_PAYMENT_MUTATION, GET_PAYMENT_STATUS_QUERY } from './payment.queries.js';

export async function initiatePayment(cartId: string): Promise<unknown> {
    return graphqlClient.request(INITIATE_PAYMENT_MUTATION, {
        input: { cartId },
    });
}

export async function getPaymentStatus(paymentOrderId: string): Promise<unknown> {
    return graphqlClient.request(GET_PAYMENT_STATUS_QUERY, { paymentOrderId });
}
