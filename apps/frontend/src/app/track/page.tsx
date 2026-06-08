"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, Loader2, Search, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  fetchTrackingLookup,
  TrackingLookupResult,
} from "@/lib/queries/tracking";

export default function TrackSearchPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [awb, setAwb] = useState("");
  const [validationError, setValidationError] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: (q: string) => fetchTrackingLookup(q),
    onSuccess: (result: TrackingLookupResult) => {
      if (result.hasAwb && result.awbNumber) {
        router.push(`/track/${result.awbNumber}`);
      } else if (result.orderId) {
        // Order found but no AWB yet — redirect to order details page
        router.push(`/track/order/${result.orderId}`);
      }
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const filledCount =
      (orderId.trim() ? 1 : 0) + (phone.trim() ? 1 : 0) + (awb.trim() ? 1 : 0);

    if (filledCount === 0) {
      setValidationError("Please enter at least one field to search.");
      return;
    }

    if (filledCount > 1) {
      setValidationError("Please enter only one field to search.");
      return;
    }

    const activeQuery = orderId.trim() || phone.trim() || awb.trim();
    mutate(activeQuery);
  };

  const displayError = validationError || (error as Error)?.message;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-block mb-6 text-sm text-yellow-600 hover:underline"
        >
          ← Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
              <PackageSearch className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Track Your Order
            </h1>
            <p className="text-gray-500 text-sm">
              Enter any one thing and find out the order details.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="order-id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Order ID
              </label>
              <input
                id="order-id"
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setValidationError("");
                }}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                placeholder="e.g. ORD-123456"
              />
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setValidationError("");
                }}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                placeholder="e.g. 9876543210"
              />
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div>
              <label
                htmlFor="awb"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                AWB Number
              </label>
              <input
                id="awb"
                type="text"
                value={awb}
                onChange={(e) => {
                  setAwb(e.target.value);
                  setValidationError("");
                }}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                placeholder="e.g. 7D12345678"
              />
            </div>

            {displayError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{displayError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{ backgroundColor: "#0c5273" }}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c5273] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:brightness-90"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </span>
              ) : (
                "Track Order"
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </main>
  );
}
