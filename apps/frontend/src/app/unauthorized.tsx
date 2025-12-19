import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
            <svg
              className="w-10 h-10 text-amber-600 dark:text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-9xl font-bold text-zinc-900 dark:text-zinc-100">401</h1>
          <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
          Unauthorized
        </h2>
        
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Please log in to access this page.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Log In
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
