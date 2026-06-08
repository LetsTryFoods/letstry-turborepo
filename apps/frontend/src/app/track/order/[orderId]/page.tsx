"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBackendApiUrl } from "@/lib/utils/api";
import {
  ShoppingBag,
  Loader2,
  XCircle,
  Package,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  totalPrice: string;
  variant: string | null;
  image: string | null;
}

interface OrderDetails {
  orderId: string;
  orderStatus: string;
  totalAmount: string;
  currency: string;
  items: OrderItem[];
  recipientContact: { phone: string; email?: string } | null;
  createdAt: string;
  shippingAddressId?: {
    buildingName: string;
    floor?: string;
    streetArea?: string;
    landmark?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  } | null;
}

interface LookupResponse {
  awbNumber: string | null;
  orderId: string | null;
  hasAwb: boolean;
  order: OrderDetails | null;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Order Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  SHIPMENT_FAILED: "Shipment Issue",
};

export default function OrderTrackPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [data, setData] = useState<LookupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imageCdn = process.env.NEXT_PUBLIC_API_IMAGE_URL;

  useEffect(() => {
    if (!orderId) return;
    const baseUrl = getBackendApiUrl();
    // Re-lookup by orderId to get fresh order data
    fetch(`${baseUrl}/shipments/lookup?q=${encodeURIComponent(orderId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((json: LookupResponse) => {
        // If AWB has now been generated, redirect to the tracking page
        if (json.hasAwb && json.awbNumber) {
          window.location.replace(`/track/${json.awbNumber}`);
          return;
        }
        setData(json);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </main>
    );
  }

  if (error || !data || !data.order) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            No order found for <span className="font-medium">{orderId}</span>
          </p>
          <Link href="/" className="text-yellow-600 hover:underline text-sm">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  const order = data.order;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="text-sm text-yellow-600 hover:underline">
          ← Back to home
        </Link>

        {/* ── Prominent "packing soon" notice ── */}
        <div
          className="rounded-2xl p-6 md:p-8 text-center shadow-md border-2"
          style={{
            background: "linear-gradient(135deg, #001f3f 0%, #0c5273 100%)",
            borderColor: "#0c5273",
          }}
        >
          <div className="flex justify-center mb-4">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Package className="h-10 w-10 text-yellow-400" />
            </div>
          </div>
          <p
            className="font-extrabold text-white leading-tight mb-3"
            style={{ fontSize: "1.45rem", lineHeight: "1.35" }}
          >
            🚚 You'll get tracking details as soon as your order gets packed!
          </p>
          <p className="text-blue-200 text-sm mt-2">
            Your order is confirmed and being prepared. We'll update you with a
            tracking number once it's on its way.
          </p>
        </div>

        {/* ── Order Status Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
              <p className="text-lg font-semibold text-gray-900">
                #{order.orderId}
              </p>
            </div>
            <span className="ml-auto inline-block text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
              {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-100">
            <div className="flex gap-2 items-start">
              <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Order Placed</p>
                <p className="font-medium text-gray-800">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>
            {order.recipientContact?.phone && (
              <div className="flex gap-2 items-start">
                <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Contact</p>
                  <p className="font-medium text-gray-800">
                    {order.recipientContact.phone}
                  </p>
                </div>
              </div>
            )}
            {order.shippingAddressId && (
              <div className="flex gap-2 items-start sm:col-span-2 pt-2 border-t border-gray-50">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Shipping Address</p>
                  <p className="font-medium text-gray-800 text-xs leading-relaxed">
                    {[
                      order.shippingAddressId.floor,
                      order.shippingAddressId.buildingName,
                      order.shippingAddressId.streetArea,
                      order.shippingAddressId.landmark,
                      order.shippingAddressId.addressLocality,
                      order.shippingAddressId.addressRegion,
                      order.shippingAddressId.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Order Items ── */}
        {order.items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex gap-2 items-center">
              <ShoppingBag className="h-4 w-4 text-yellow-500" />
              Items in your order
            </h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={`${imageCdn}/${item.image}`}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover shrink-0 bg-gray-50"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-gray-400">{item.variant}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-800 shrink-0">
                    ₹{item.totalPrice}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold text-gray-900">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
