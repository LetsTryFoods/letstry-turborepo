import { useCallback } from 'react';
import { pushToDataLayer } from '@/lib/analytics/data-layer';

export const useAnalytics = () => {
  const trackPageView = useCallback((url: string) => {
    pushToDataLayer({
      event: 'page_view',
      page_path: url,
    });
  }, []);

  const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    pushToDataLayer({
      event: eventName,
      ...params,
    });
  }, []);

  const trackViewItem = useCallback((product: {
    id: string;
    name: string;
    price: number;
    category?: string;
    variant?: string;
  }) => {
    pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        currency: 'INR',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.category,
            item_variant: product.variant,
            quantity: 1,
          },
        ],
      },
    });
  }, []);

  const trackAddToCart = useCallback((product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    variant?: string;
  }) => {
    pushToDataLayer({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'INR',
        value: product.price * product.quantity,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.category,
            item_variant: product.variant,
            quantity: product.quantity,
          },
        ],
      },
    });
  }, []);

  const trackRemoveFromCart = useCallback((product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    variant?: string;
  }) => {
    pushToDataLayer({
      event: 'remove_from_cart',
      ecommerce: {
        currency: 'INR',
        value: product.price * product.quantity,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.category,
            item_variant: product.variant,
            quantity: product.quantity,
          },
        ],
      },
    });
  }, []);

  const trackBeginCheckout = useCallback((cartData: {
    value: number;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      variant?: string;
    }>;
    coupon?: string;
  }) => {
    pushToDataLayer({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'INR',
        value: cartData.value,
        coupon: cartData.coupon,
        items: cartData.items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
          item_variant: item.variant,
          quantity: item.quantity,
        })),
      },
    });
  }, []);

  const trackPurchase = useCallback((orderData: {
    transactionId: string;
    value: number;
    tax?: number;
    shipping?: number;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      variant?: string;
    }>;
    coupon?: string;
  }) => {
    pushToDataLayer({
      event: 'purchase',
      ecommerce: {
        transaction_id: orderData.transactionId,
        currency: 'INR',
        value: orderData.value,
        tax: orderData.tax,
        shipping: orderData.shipping,
        coupon: orderData.coupon,
        items: orderData.items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
          item_variant: item.variant,
          quantity: item.quantity,
        })),
      },
    });
  }, []);

  const trackViewItemList = useCallback((items: Array<{
    id: string;
    name: string;
    price: number;
    category?: string;
    variant?: string;
    position?: number;
  }>, listName: string) => {
    pushToDataLayer({
      event: 'view_item_list',
      ecommerce: {
        item_list_name: listName,
        currency: 'INR',
        items: items.map((item, index) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
          item_variant: item.variant,
          index: item.position || index,
        })),
      },
    });
  }, []);

  const trackSelectItem = useCallback((product: {
    id: string;
    name: string;
    price: number;
    category?: string;
    variant?: string;
    position?: number;
    listName?: string;
  }) => {
    pushToDataLayer({
      event: 'select_item',
      ecommerce: {
        item_list_name: product.listName,
        currency: 'INR',
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.category,
            item_variant: product.variant,
            index: product.position,
          },
        ],
      },
    });
  }, []);

  const trackViewCart = useCallback((cartData: {
    value: number;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      variant?: string;
    }>;
  }) => {
    pushToDataLayer({
      event: 'view_cart',
      ecommerce: {
        currency: 'INR',
        value: cartData.value,
        items: cartData.items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
          item_variant: item.variant,
          quantity: item.quantity,
        })),
      },
    });
  }, []);

  const trackAddShippingInfo = useCallback((cartData: {
    value: number;
    shippingTier?: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      variant?: string;
    }>;
  }) => {
    pushToDataLayer({
      event: 'add_shipping_info',
      ecommerce: {
        currency: 'INR',
        value: cartData.value,
        shipping_tier: cartData.shippingTier,
        items: cartData.items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_variant: item.variant,
          quantity: item.quantity,
        })),
      },
    });
  }, []);

  const trackAddPaymentInfo = useCallback((cartData: {
    value: number;
    paymentType?: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      variant?: string;
    }>;
  }) => {
    pushToDataLayer({
      event: 'add_payment_info',
      ecommerce: {
        currency: 'INR',
        value: cartData.value,
        payment_type: cartData.paymentType,
        items: cartData.items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_variant: item.variant,
          quantity: item.quantity,
        })),
      },
    });
  }, []);

  const trackSearch = useCallback((searchTerm: string) => {
    pushToDataLayer({
      event: 'search',
      search_term: searchTerm,
    });
  }, []);

  const trackViewPromotion = useCallback((promo: {
    promotionId: string;
    promotionName: string;
    creativeName?: string;
    creativeSlot?: string;
  }) => {
    pushToDataLayer({
      event: 'view_promotion',
      ecommerce: {
        promotion_id: promo.promotionId,
        promotion_name: promo.promotionName,
        creative_name: promo.creativeName,
        creative_slot: promo.creativeSlot,
      },
    });
  }, []);

  const trackSelectPromotion = useCallback((promo: {
    promotionId: string;
    promotionName: string;
    creativeName?: string;
    creativeSlot?: string;
  }) => {
    pushToDataLayer({
      event: 'select_promotion',
      ecommerce: {
        promotion_id: promo.promotionId,
        promotion_name: promo.promotionName,
        creative_name: promo.creativeName,
        creative_slot: promo.creativeSlot,
      },
    });
  }, []);

  const setUser = useCallback((userId: string, properties?: Record<string, any>) => {
    pushToDataLayer({
      event: 'user_data',
      userId,
      ...properties,
    });
  }, []);

  return {
    trackPageView,
    trackEvent,
    trackViewItem,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,
    trackViewItemList,
    trackSelectItem,
    trackViewCart,
    trackAddShippingInfo,
    trackAddPaymentInfo,
    trackSearch,
    trackViewPromotion,
    trackSelectPromotion,
    setUser,
  };
};
