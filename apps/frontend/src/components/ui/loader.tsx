"use client";

export function Loader({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div role="status" className={`flex items-center justify-center ${className}`}> 
      <svg className="animate-spin text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z" />
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default Loader;
