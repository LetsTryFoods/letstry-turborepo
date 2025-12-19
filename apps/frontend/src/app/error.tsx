"use client"

import { ErrorLink } from "@/components/error/ErrorLink";


export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Something Went Wrong
          </h1>
          <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-red-500 to-orange-600 rounded-full"></div>
        </div>
        
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        
        {error.digest && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try Again
          </button>
          
      
          <ErrorLink direction="/" data="Go Home" />
        </div>
      </div>
    </div>
  );
}
