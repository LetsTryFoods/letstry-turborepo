import { gql } from '@apollo/client'

export const GET_COUPONS = gql`
  query GetCoupons {
    coupons {
      _id
      name
      description
      code
      discountType
      discountValue
      minCartValue
      maxDiscountAmount
      startDate
      endDate
      isActive
   
      createdAt
      updatedAt
    }
  }
`

export const GET_COUPON_BY_CODE = gql`
  query GetCouponByCode($code: String!) {
    coupon(code: $code) {
      _id
      name
      description
      code
      discountType
      discountValue
      minCartValue
      maxDiscountAmount
      startDate
      endDate
      isActive
    
      createdAt
      updatedAt
    }
  }
`

export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
      _id
      name
      description
      code
      discountType
      discountValue
      minCartValue
      maxDiscountAmount
      startDate
      endDate
      isActive
    }
  }
`

export const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: ID!) {
    deleteCoupon(id: $id) {
      _id
      name
    }
  }
`



// Additional Context: These are recently edited files. Do not suggest code that has been deleted.
/* 
    eligibilityType
      applicationScope
      usageLimit
      usageCount

    */