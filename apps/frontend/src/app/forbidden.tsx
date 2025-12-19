import Link from 'next/link';

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/20 mb-4">
            <svg
              className="w-10 h-10 text-rose-600 dark:text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-9xl font-bold text-zinc-900 dark:text-zinc-100">403</h1>
          <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-rose-500 to-pink-600 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
          Forbidden
        </h2>
        
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          You are not authorized to access this resource.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
