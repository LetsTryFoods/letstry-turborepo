import axios from 'axios';
// import { API_BASE_URL } from '@env';

const API_BASE_URL = "https://apiv2.letstryfoods.com"

const CouponService = {
  // Fetch all active coupons
  fetchActiveCoupons: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/promocode/active`);
      
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Coupons fetched successfully'
        };
      }
      
      return {
        success: false,
        data: [],
        message: 'Failed to fetch coupons'
      };
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Network error while fetching coupons'
      };
    }
  },

  // Apply a coupon code
  applyCoupon: async (couponCode, cartTotal) => {
    try {
      const requestBody = {
        code: couponCode,
        cartTotal: cartTotal
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/promocode/apply`, 
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200 && response.data.valid) {
        return {
          success: true,
          valid: response.data.valid,
          discountAmount: response.data.discountAmount,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        valid: false,
        discountAmount: 0,
        message: response.data.message || 'Coupon is not valid'
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return {
        success: false,
        valid: false,
        discountAmount: 0,
        message: error.response?.data?.message || 'Failed to apply coupon'
      };
    }
  }
};

export default CouponService;
