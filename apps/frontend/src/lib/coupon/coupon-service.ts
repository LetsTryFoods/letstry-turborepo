import { graphqlClient } from '@/lib/graphql/client-factory';
import { APPLY_COUPON, REMOVE_COUPON } from '@/lib/queries/coupon';

export const CouponService = {
  applyCoupon: async (code: string) => {
    return await graphqlClient.request(APPLY_COUPON.toString(), { code });
  },

  removeCoupon: async () => {
    return await graphqlClient.request(REMOVE_COUPON.toString());
  },
};
