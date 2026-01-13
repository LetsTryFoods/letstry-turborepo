import { useAnalytics } from '@/hooks/use-analytics';

export const useCheckoutTracking = () => {
  const { trackBeginCheckout, trackPurchase } = useAnalytics();

  const trackCheckoutStart = (cartData: any) => {
    const items = cartData.myCart?.items?.map((item: any) => ({
      id: item.productId,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      category: item.category,
      variant: item.variantName,
    })) || [];

    trackBeginCheckout({
      value: cartData.myCart?.totalsSummary?.grandTotal || 0,
      items,
      coupon: cartData.myCart?.couponCode,
    });
  };

  const trackOrderComplete = (orderData: any) => {
    const items = orderData.items?.map((item: any) => ({
      id: item.productId,
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      variant: item.variantName,
    })) || [];

    trackPurchase({
      transactionId: orderData.orderId,
      value: orderData.totalAmount,
      tax: orderData.tax,
      shipping: orderData.shippingCost,
      items,
      coupon: orderData.couponCode,
    });
  };

  return {
    trackCheckoutStart,
    trackOrderComplete,
  };
};
