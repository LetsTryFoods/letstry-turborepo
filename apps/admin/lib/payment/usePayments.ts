import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_ADMIN_PAYMENTS_LIST,
  GET_ADMIN_PAYMENT_DETAIL,
  INITIATE_ADMIN_REFUND,
  GET_ADMIN_PAYMENTS_BY_IDENTITY,
  GET_ADMIN_PAYMENTS_BY_ORDER,
} from '@/lib/graphql/payments'

export const usePaymentsList = (input: any) => {
  return useQuery(GET_ADMIN_PAYMENTS_LIST, {
    variables: { input },
    fetchPolicy: 'cache-and-network',
  })
}

export const usePaymentDetail = (paymentOrderId: string) => {
  return useQuery(GET_ADMIN_PAYMENT_DETAIL, {
    variables: { paymentOrderId },
    fetchPolicy: 'cache-and-network',
    skip: !paymentOrderId,
  })
}

export const usePaymentsByIdentity = (identityId: string) => {
  return useQuery(GET_ADMIN_PAYMENTS_BY_IDENTITY, {
    variables: { identityId },
    fetchPolicy: 'cache-and-network',
    skip: !identityId,
  })
}

export const usePaymentsByOrder = (orderId: string) => {
  return useQuery(GET_ADMIN_PAYMENTS_BY_ORDER, {
    variables: { orderId },
    fetchPolicy: 'cache-and-network',
    skip: !orderId,
  })
}

export const useInitiateRefund = () => {
  const [mutate, { loading, error }] = useMutation(INITIATE_ADMIN_REFUND)
  return { mutate, loading, error }
}
