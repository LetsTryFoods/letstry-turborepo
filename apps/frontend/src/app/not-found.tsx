'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-zinc-900 dark:text-zinc-100">404</h1>
          <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
