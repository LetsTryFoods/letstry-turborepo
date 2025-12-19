import { graphql } from '@/gql';

export const GET_ACTIVE_COUPONS = graphql(`
  query GetActiveCoupons {
    activeCoupons {
      _id
      code
      description
      name
      discountType
      discountValue
      minCartValue
      endDate
    }
  }
`);

export const APPLY_COUPON = graphql(`
  mutation ApplyCoupon($code: String!) {
    applyCoupon(code: $code) {
      _id
      couponCode
      totalsSummary {
        subtotal
        discountAmount
        grandTotal
      }
    }
  }
`);

export const REMOVE_COUPON = graphql(`
  mutation RemoveCoupon {
    removeCoupon {
      _id
      couponCode
      totalsSummary {
        subtotal
        discountAmount
        grandTotal
      }
    }
  }
`);
