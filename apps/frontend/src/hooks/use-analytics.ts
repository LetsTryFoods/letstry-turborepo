import { useCallback } from 'react';
import * as gtag from '@/lib/analytics/google-analytics';
import { pushToDataLayer } from '@/lib/analytics/data-layer';

export const useAnalytics = () => {
  const trackPageView = useCallback((url: string) => {
    gtag.pageview(url);
    pushToDataLayer({
      event: 'pageview',
      page: url,
    });
  }, []);

  const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    gtag.event(eventName, params);
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
    const eventData = {
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
    };

    gtag.ecommerceEvent('view_item', eventData);
    pushToDataLayer({
      event: 'view_item',
      ecommerce: eventData,
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
    const eventData = {
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
    };

    gtag.ecommerceEvent('add_to_cart', eventData);
    pushToDataLayer({
      event: 'add_to_cart',
      ecommerce: eventData,
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
    const eventData = {
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
    };

    gtag.ecommerceEvent('remove_from_cart', eventData);
    pushToDataLayer({
      event: 'remove_from_cart',
      ecommerce: eventData,
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
    const eventData = {
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
    };

    gtag.ecommerceEvent('begin_checkout', eventData);
    pushToDataLayer({
      event: 'begin_checkout',
      ecommerce: eventData,
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
    const eventData = {
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
    };

    gtag.ecommerceEvent('purchase', eventData);
    pushToDataLayer({
      event: 'purchase',
      ecommerce: eventData,
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
    const eventData = {
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
    };

    gtag.ecommerceEvent('view_item_list', eventData);
    pushToDataLayer({
      event: 'view_item_list',
      ecommerce: eventData,
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
    const eventData = {
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
    };

    gtag.ecommerceEvent('select_item', eventData);
    pushToDataLayer({
      event: 'select_item',
      ecommerce: eventData,
    });
  }, []);

  const setUser = useCallback((userId: string, properties?: Record<string, any>) => {
    gtag.userProperties(userId, properties);
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
    setUser,
  };
};
