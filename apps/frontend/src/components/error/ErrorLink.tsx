"use client"
import Link from 'next/link'

export function ErrorLink({direction, data}: {direction :string, data:string} ) {
  return (
       <Link
            href={direction}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {data}
          </Link>
        
  )
}