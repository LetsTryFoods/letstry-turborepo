import { graphqlClient } from '@/lib/graphql/client-factory';
import { INITIATE_PAYMENT } from '@/lib/queries/payment';

export interface InitiatePaymentInput {
  cartId: string;
  amount: string;
  currency: string;
}

export const PaymentService = {
  initiatePayment: async (input: InitiatePaymentInput) => {
    return await graphqlClient.request(INITIATE_PAYMENT, {
      input,
    });
  },
};
