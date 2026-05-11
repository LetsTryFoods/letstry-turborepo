declare global {
  interface Window {
    dataLayer?: Object[];
    gtag?: (...args: any[]) => void;
  }
}

type DataLayerEvent = {
  event: string;
  [key: string]: any;
};

/**
 * Push an event to the GTM dataLayer with auto-injected GA4 attribution params.
 *
 * `page_location` (the absolute URL) and `page_title` are injected on every
 * event so GA4 can attribute conversions back to the originating page.
 * Without these, GA4 reports `(not set)` for landing-page attribution
 * across page_view, view_item, add_to_cart, begin_checkout, purchase,
 * view_item_list and select_item events.
 *
 * Before any event carrying an `ecommerce` payload, `{ ecommerce: null }` is
 * pushed first to clear GTM's items variable. Without this, GTM merges the
 * previous event's items into the next event (Google's documented gotcha).
 *
 * Caller-provided values win — if `data` already includes `page_location`
 * or `page_title`, the spread below preserves them.
 */
export const pushToDataLayer = (data: DataLayerEvent) => {
  if (typeof window === 'undefined') return;

  const { event, ...rest } = data;
  const payload = {
    page_location: window.location.href,
    page_title: document.title,
    ...rest,
  };

  // Send directly to GA4 using the native window.gtag function
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, payload);
  } else if (window.dataLayer) {
    // Fallback if gtag is not ready yet: push the arguments object that gtag expects
    window.dataLayer.push((function (..._args: any[]) { return arguments; })('event', event, payload));

    // Also push the GTM object format
    window.dataLayer.push({
      event,
      ...payload,
    });
  }
};

export const trackPageView = (url: string) => {
  pushToDataLayer({
    event: 'pageview',
    page: url,
  });
};

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  pushToDataLayer({
    event: eventName,
    ...eventParams,
  });
};

export const trackEcommerce = (
  action: 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'purchase',
  data: Record<string, any>
) => {
  pushToDataLayer({
    event: action,
    ecommerce: data,
  });
};

export const trackUser = (userId: string, userData?: Record<string, any>) => {
  pushToDataLayer({
    event: 'user_data',
    userId,
    ...userData,
  });
};
