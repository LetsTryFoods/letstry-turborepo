'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const paymentOrderId = searchParams.get('paymentOrderId');

    if (status === 'success') {
      router.replace(`/order-success?orderId=${orderId || ''}`);
    } else if (status === 'failure' || status === 'failed') {
      router.replace(`/payment-failed?paymentOrderId=${paymentOrderId || ''}`);
    } else {
      router.replace('/');
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing your payment...</p>
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C5273] mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </main>
    }>
      <PaymentCallback />
    </Suspense>
  );
}
