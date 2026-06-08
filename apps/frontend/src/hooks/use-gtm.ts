import { useCallback } from "react";
import {
  trackEvent,
  trackEcommerce,
  trackPageView,
  trackUser,
} from "@/lib/analytics/data-layer";

export const useGTM = () => {
  const event = useCallback(
    (eventName: string, eventParams?: Record<string, any>) => {
      trackEvent(eventName, eventParams);
    },
    [],
  );

  const pageView = useCallback((url: string) => {
    trackPageView(url);
  }, []);

  const ecommerce = useCallback(
    (
      action:
        | "view_item"
        | "add_to_cart"
        | "remove_from_cart"
        | "begin_checkout"
        | "purchase",
      data: Record<string, any>,
    ) => {
      trackEcommerce(action, data);
    },
    [],
  );

  const user = useCallback((userId: string, userData?: Record<string, any>) => {
    trackUser(userId, userData);
  }, []);

  return {
    event,
    pageView,
    ecommerce,
    user,
  };
};
