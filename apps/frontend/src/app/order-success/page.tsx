"use client";

import { Suspense, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGraphQLQuery } from "@/lib/graphql/use-graphql-query";
import { GET_ORDER_BY_ID } from "@/lib/queries/orders";
import { useAnalytics } from "@/hooks/use-analytics";
import { getSavedUtmParams } from "@/lib/analytics/utm-capture";

type OrderItem = {
  variantId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  name: string;
  sku?: string;
  variant?: string;
};

type OrderPayload = {
  getOrderById: {
    _id: string;
    orderId: string;
    orderStatus: string;
    totalAmount: number;
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    currency: string;
    items: OrderItem[];
    payment?: {
      method?: string;
      transactionId?: string;
    };
  } | null;
};

function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { trackPurchase } = useAnalytics();

  const { data } = useGraphQLQuery<OrderPayload>(
    ["order", orderId],
    GET_ORDER_BY_ID,
    orderId ? { orderId } : undefined,
    {
      enabled: Boolean(orderId),
      retry: 1,
      staleTime: Infinity,
    },
  );

  const order = data?.getOrderById;

  useEffect(() => {
    if (!orderId) return;
    if (typeof window === "undefined") return;

    const guardKey = `ga4_purchase_fired:${orderId}`;
    if (sessionStorage.getItem(guardKey)) return;

    // Try to get cart data from localStorage (saved before payment redirect)
    try {
      const raw = localStorage.getItem("pending_purchase_data");
      if (!raw) return;

      const purchaseData = JSON.parse(raw);

      // Ignore stale data older than 2 hours
      if (Date.now() - purchaseData.savedAt > 2 * 60 * 60 * 1000) {
        localStorage.removeItem("pending_purchase_data");
        return;
      }

      const value = Number(purchaseData.totalAmount) || 0;
      if (value < 1) return;

      // Get saved UTM params from session (captured on landing)
      const utmParams = getSavedUtmParams();

      trackPurchase({
        transactionId: orderId,
        value,
        items: purchaseData.items,
        // Attach UTM so GA4 can attribute this purchase to the correct source
        ...(utmParams?.utm_source && {
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_term: utmParams.utm_term,
          utm_content: utmParams.utm_content,
        }),
      });

      sessionStorage.setItem(guardKey, "1");
      // Clear after use
      localStorage.removeItem("pending_purchase_data");
    } catch (e) {
      // localStorage unavailable or data corrupted
    }
  }, [orderId, trackPurchase]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Confirmed
        </h1>

        {orderId && (
          <p className="text-sm text-gray-500 mb-4">Order ID: {orderId}</p>
        )}

        <p className="text-gray-600 mb-8">
          Thank you for your purchase! Your order has been successfully placed.
        </p>

        <div className="space-y-4">
          <Link
            href="/profile"
            className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            View Orders
          </Link>

          <Link
            href="/"
            className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Confirmed
            </h1>
          </div>
        </main>
      }
    >
      <OrderSuccess />
    </Suspense>
  );
}
