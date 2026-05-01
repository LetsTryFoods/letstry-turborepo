"use client";

import { useState } from "react";
import { X, PhoneCall, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NotificationBanner = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!pathname.startsWith("/track")) return null;
  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#001f3f] text-yellow-400 px-4 py-4 md:py-5 relative z-40 border-b border-yellow-500/20 shadow-md">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 pr-8 md:pr-12">
        <div className="text-base md:text-lg font-medium flex-1 text-center md:text-left text-yellow-50 leading-relaxed max-w-4xl">
          <strong className="text-yellow-400 text-lg uppercase tracking-wider mr-2">Notice:</strong> 
          Orders placed from April 10 onwards are experiencing delays of approximately <span className="font-bold text-yellow-400">15–20 days</span> due to logistics issues. We sincerely apologize for the inconvenience.
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold shrink-0">
          <Link 
            href="/contact-us?queryType=logistics_delay" 
            className="flex items-center gap-1.5 px-5 py-2 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#001f3f] rounded-full transition-all"
          >
            Raise a Query <ArrowRight className="h-4 w-4" />
          </Link>
          <a 
            href="tel:8840330283" 
            className="flex items-center gap-2 bg-yellow-400 text-black px-5 py-2 rounded-full hover:bg-yellow-300 font-bold transition-all shadow-lg shadow-yellow-400/20"
          >
            <PhoneCall className="h-4 w-4" />
            <span className="text-sm md:text-base">Call 8840330283</span>
          </a>
        </div>
      </div>
      
      <button 
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-yellow-400 hover:text-yellow-200 transition-colors rounded-full hover:bg-blue-900"
        aria-label="Dismiss banner"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
};
