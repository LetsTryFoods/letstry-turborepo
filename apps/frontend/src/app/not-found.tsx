'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8 relative">
          <Image
            src="https://d2tmwt8yl5m7qh.cloudfront.net/f0a436cea8f26a903b28b37dd63e0491.webp"
            alt="404 Error - Cute dog illustration"
            width={859}
            height={582}
            className="w-full max-w-2xl h-auto mx-auto"
            priority
          />
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-base sm:text-lg text-gray-600 mb-4">
          We apologize for the inconvenience.
        </p>

        <p className="text-sm sm:text-base text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-[#0C5273] text-white font-semibold hover:bg-[#0C5273]/80 transition-colors shadow-md"
          >
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
