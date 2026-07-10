import { useCallback } from "react";
import { pushToDataLayer } from "@/lib/analytics/data-layer";
import { mpTrack } from "@/lib/analytics/mixpanel";

export const useAnalytics = () => {
  const trackPageView = useCallback((url: string) => {
    pushToDataLayer({
      event: "page_view",
      page_path: url,
    });
    // Mixpanel autocapture handles page views automatically,
    // but we also fire a manual event for funnel attribution.
    mpTrack("Page Viewed", { url });
  }, []);

  const trackEvent = useCallback(
    (eventName: string, params?: Record<string, any>) => {
      pushToDataLayer({
        event: eventName,
        ...params,
      });
    },
    [],
  );

  const trackViewItem = useCallback(
    (product: {
      id: string;
      name: string;
      price: number;
      category?: string;
      variant?: string;
    }) => {
      pushToDataLayer({
        event: "view_item",
        ecommerce: {
          currency: "INR",
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

      // Mixpanel — Funnel Step 2
      mpTrack("Product Viewed", {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        category: product.category ?? null,
        variant: product.variant ?? null,
        currency: "INR",
        source_page:
          typeof window !== "undefined" ? window.location.pathname : null,
      });
    },
    [],
  );

  const trackAddToCart = useCallback(
    (product: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      variant?: string;
      cartValue?: number;
    }) => {
      pushToDataLayer({
        event: "add_to_cart",
        ecommerce: {
          currency: "INR",
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

      // Meta Pixel Tracking
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "AddToCart", {
          content_name: product.name,
          content_ids: [product.id],
          content_type: "product",
          value: product.price * product.quantity,
          currency: "INR",
        });
      }

      // Mixpanel — Funnel Step 3
      mpTrack("Product Added", {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: product.quantity,
        variant: product.variant ?? null,
        category: product.category ?? null,
        cart_value: product.cartValue ?? product.price * product.quantity,
        currency: "INR",
      });
    },
    [],
  );

  const trackRemoveFromCart = useCallback(
    (product: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      variant?: string;
    }) => {
      pushToDataLayer({
        event: "remove_from_cart",
        ecommerce: {
          currency: "INR",
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

      // Mixpanel
      mpTrack("Product Removed", {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: product.quantity,
        variant: product.variant ?? null,
        category: product.category ?? null,
      });
    },
    [],
  );

  const trackBeginCheckout = useCallback(
    (cartData: {
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
        event: "begin_checkout",
        ecommerce: {
          currency: "INR",
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

      // Mixpanel — Funnel Step 7
      mpTrack("Checkout Started", {
        cart_value: cartData.value,
        item_count: cartData.items.reduce((s, i) => s + i.quantity, 0),
        coupon: cartData.coupon ?? null,
        currency: "INR",
        items: cartData.items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant ?? null,
        })),
      });
    },
    [],
  );

  const trackPurchase = useCallback(
    (orderData: {
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
      paymentMethod?: string;
    }) => {
      pushToDataLayer({
        event: "purchase",
        ecommerce: {
          transaction_id: orderData.transactionId,
          currency: "INR",
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

      // Meta Pixel Tracking
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Purchase", {
          content_ids: orderData.items.map((item) => item.id),
          content_type: "product",
          value: orderData.value,
          currency: "INR",
          num_items: orderData.items.reduce(
            (total, item) => total + item.quantity,
            0,
          ),
        });
      }

      // Mixpanel — Funnel Step 10
      mpTrack("Order Completed", {
        order_id: orderData.transactionId,
        revenue: orderData.value,
        shipping: orderData.shipping ?? 0,
        tax: orderData.tax ?? 0,
        coupon: orderData.coupon ?? null,
        payment_method: orderData.paymentMethod ?? null,
        currency: "INR",
        items: orderData.items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant ?? null,
          category: item.category ?? null,
        })),
      });
    },
    [],
  );

  const trackViewItemList = useCallback(
    (
      items: Array<{
        id: string;
        name: string;
        price: number;
        category?: string;
        variant?: string;
        position?: number;
      }>,
      listName: string,
    ) => {
      pushToDataLayer({
        event: "view_item_list",
        ecommerce: {
          item_list_name: listName,
          currency: "INR",
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

      // Mixpanel — Funnel Step 1
      mpTrack("Product List Viewed", {
        list_name: listName,
        source_page:
          typeof window !== "undefined" ? window.location.pathname : null,
        products: items.map((item, index) => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          category: item.category ?? null,
          position: item.position ?? index,
        })),
      });
    },
    [],
  );

  const trackSelectItem = useCallback(
    (product: {
      id: string;
      name: string;
      price: number;
      category?: string;
      variant?: string;
      position?: number;
      listName?: string;
    }) => {
      pushToDataLayer({
        event: "select_item",
        ecommerce: {
          item_list_name: product.listName,
          currency: "INR",
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
    },
    [],
  );

  const trackViewCart = useCallback(
    (cartData: {
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
        event: "view_cart",
        ecommerce: {
          currency: "INR",
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

      // Mixpanel — Funnel Step 4
      mpTrack("Cart Viewed", {
        cart_value: cartData.value,
        item_count: cartData.items.reduce((s, i) => s + i.quantity, 0),
        currency: "INR",
        items: cartData.items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant ?? null,
        })),
      });
    },
    [],
  );

  const trackAddShippingInfo = useCallback(
    (cartData: {
      value: number;
      shippingTier?: string;
      city?: string;
      pincode?: string;
      addressType?: string;
      items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        variant?: string;
      }>;
    }) => {
      pushToDataLayer({
        event: "add_shipping_info",
        ecommerce: {
          currency: "INR",
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

      // Mixpanel — Funnel Step 6
      mpTrack("Shipping Info Added", {
        cart_value: cartData.value,
        city: cartData.city ?? cartData.shippingTier ?? null,
        pincode: cartData.pincode ?? null,
        address_type: cartData.addressType ?? null,
        currency: "INR",
      });
    },
    [],
  );

  const trackAddPaymentInfo = useCallback(
    (cartData: {
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
        event: "add_payment_info",
        ecommerce: {
          currency: "INR",
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

      // Mixpanel — Funnel Step 8
      mpTrack("Payment Info Added", {
        payment_method: cartData.paymentType ?? null,
        cart_value: cartData.value,
        currency: "INR",
      });
    },
    [],
  );

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    pushToDataLayer({
      event: "search",
      search_term: searchTerm,
    });

    // Mixpanel
    mpTrack("Search Performed", {
      query: searchTerm,
      results_count: resultsCount ?? null,
    });
  }, []);

  const trackViewPromotion = useCallback(
    (promo: {
      promotionId: string;
      promotionName: string;
      creativeName?: string;
      creativeSlot?: string;
    }) => {
      pushToDataLayer({
        event: "view_promotion",
        ecommerce: {
          promotion_id: promo.promotionId,
          promotion_name: promo.promotionName,
          creative_name: promo.creativeName,
          creative_slot: promo.creativeSlot,
        },
      });

      // Mixpanel
      mpTrack("Promotion Viewed", {
        promo_id: promo.promotionId,
        promo_name: promo.promotionName,
        slot: promo.creativeSlot ?? null,
      });
    },
    [],
  );

  const trackSelectPromotion = useCallback(
    (promo: {
      promotionId: string;
      promotionName: string;
      creativeName?: string;
      creativeSlot?: string;
    }) => {
      pushToDataLayer({
        event: "select_promotion",
        ecommerce: {
          promotion_id: promo.promotionId,
          promotion_name: promo.promotionName,
          creative_name: promo.creativeName,
          creative_slot: promo.creativeSlot,
        },
      });
    },
    [],
  );

  const setUser = useCallback(
    (userId: string, properties?: Record<string, any>) => {
      pushToDataLayer({
        event: "user_data",
        userId,
        ...properties,
      });
      // Identity is handled by MixpanelProvider watching useAuthStore
    },
    [],
  );

  // ─── NEW: Payment Initiated (Funnel Step 9) ───────────────────────────────
  const trackPaymentInitiated = useCallback(
    (data: {
      payment_method: string;
      cart_value: number;
      gateway: string;
    }) => {
      pushToDataLayer({
        event: "payment_initiated",
        payment_method: data.payment_method,
        cart_value: data.cart_value,
        gateway: data.gateway,
      });

      // Mixpanel — Funnel Step 9
      mpTrack("Payment Initiated", {
        payment_method: data.payment_method,
        cart_value: data.cart_value,
        gateway: data.gateway,
        currency: "INR",
      });
    },
    [],
  );

  // ─── NEW: Payment Failed (Funnel Step 11) ────────────────────────────────
  const trackPaymentFailed = useCallback(
    (data: {
      reason?: string;
      cart_value?: number;
      payment_method?: string;
      payment_order_id?: string;
    }) => {
      pushToDataLayer({
        event: "payment_failed",
        reason: data.reason,
        cart_value: data.cart_value,
        payment_method: data.payment_method,
      });

      // Mixpanel — Funnel Step 11
      mpTrack("Payment Failed", {
        reason: data.reason ?? "unknown",
        cart_value: data.cart_value ?? null,
        payment_method: data.payment_method ?? null,
        payment_order_id: data.payment_order_id ?? null,
      });
    },
    [],
  );

  // ─── NEW: Coupon events ──────────────────────────────────────────────────
  const trackCouponApplied = useCallback(
    (data: {
      coupon_code: string;
      cart_value: number;
      discount_amount?: number;
    }) => {
      pushToDataLayer({
        event: "apply_coupon",
        coupon_code: data.coupon_code,
        cart_value: data.cart_value,
      });

      // Mixpanel — Funnel Step 5
      mpTrack("Coupon Applied", {
        coupon_code: data.coupon_code,
        cart_value: data.cart_value,
        discount_amount: data.discount_amount ?? null,
      });
    },
    [],
  );

  const trackCouponRemoved = useCallback(
    (data: { coupon_code: string; cart_value: number }) => {
      pushToDataLayer({
        event: "remove_coupon",
        coupon_code: data.coupon_code,
        cart_value: data.cart_value,
      });

      // Mixpanel
      mpTrack("Coupon Removed", {
        coupon_code: data.coupon_code,
        cart_value: data.cart_value,
      });
    },
    [],
  );

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
    // New exports
    trackPaymentInitiated,
    trackPaymentFailed,
    trackCouponApplied,
    trackCouponRemoved,
  };
};
