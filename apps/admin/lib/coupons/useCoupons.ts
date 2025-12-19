import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_COUPONS,
  GET_COUPON_BY_CODE,
  CREATE_COUPON,
  DELETE_COUPON,
} from '@/lib/graphql/coupons'

export type DiscountType = 'PERCENTAGE' | 'FIXED'

export interface Coupon {
  _id: string
  name: string
  description: string
  code: string
  discountType: DiscountType
  discountValue: number
  minCartValue?: number
  maxDiscountAmount?: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCouponInput {
  name: string
  description: string
  code: string
  discountType: DiscountType
  discountValue: number
  minCartValue?: number
  maxDiscountAmount?: number
  startDate: string
  endDate: string
  isActive?: boolean
}

export const useCoupons = () => {
  return useQuery(GET_COUPONS, {
    fetchPolicy: 'cache-and-network',
  })
}

export const useCouponByCode = (code: string) => {
  return useQuery(GET_COUPON_BY_CODE, {
    variables: { code },
    skip: !code,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreateCoupon = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_COUPON, {
    refetchQueries: [{ query: GET_COUPONS }],
    onError: (error: any) => {
      console.error('Create coupon error:', error)
    }
  })

  const createCoupon = async (input: CreateCouponInput) => {
    return mutate({ variables: { input } })
  }

  return { createCoupon, loading, error }
}

export const useDeleteCoupon = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_COUPON, {
    refetchQueries: [{ query: GET_COUPONS }],
    onError: (error: any) => {
      console.error('Delete coupon error:', error)
    }
  })

  const deleteCoupon = async (id: string) => {
    return mutate({ variables: { id } })
  }

  return { deleteCoupon, loading, error }
}
