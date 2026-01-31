'use client';

import { Suspense } from 'react';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PaymentFailed() {
  const searchParams = useSearchParams();
  const paymentOrderId = searchParams.get('paymentOrderId');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-6">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>

        {paymentOrderId && (
          <p className="text-sm text-gray-500 mb-4">
            Reference ID: {paymentOrderId}
          </p>
        )}

        <p className="text-gray-600 mb-8">
          Sorry, your payment request has failed. Please try again or use a different payment method.
        </p>

        <div className="space-y-4">
          <Link
            href="/profile?tab=orders"
            className="block w-full bg-[#0C5273] hover:bg-[#09455a] text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            View Orders
          </Link>

          <Link
            href="/"
            className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-6">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
        </div>
      </main>
    }>
      <PaymentFailed />
    </Suspense>
  );
}
