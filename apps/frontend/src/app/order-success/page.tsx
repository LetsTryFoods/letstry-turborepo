import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
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

        <p className="text-gray-600 mb-8">
          Thank you for your purchase! Your order has been successfully placed.
        </p>

        <div className="space-y-4">
          <Link
            href="/profile/orders"
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
