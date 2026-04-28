"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, PhoneCall, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const HomeAlertModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only trigger on home page
    if (pathname !== "/") return;

    const isDismissed = sessionStorage.getItem("home-alert-dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("home-alert-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Header graphic */}
        <div className="bg-[#001f3f] p-6 flex flex-col items-center relative text-center">
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="h-16 w-16 bg-yellow-400/20 rounded-full flex items-center justify-center mb-4 text-yellow-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide uppercase">Important Update</h2>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 text-center">
          <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
            Orders placed from <span className="font-bold text-gray-900 border-b-2 border-yellow-400">April 10 onwards</span> are experiencing delays of approximately <span className="font-bold text-red-600">15–20 days</span> due to logistics issues. 
            <br/><br/>
            We sincerely apologize for the inconvenience and appreciate your patience.
          </p>

          <div className="flex flex-col gap-3">
            <Link 
              href="/contact-us?queryType=ORDER_ISSUE" 
              onClick={handleDismiss}
              className="flex items-center justify-center w-full gap-2 bg-[#001f3f] text-white px-6 py-3.5 rounded-xl hover:bg-blue-900 transition-colors font-medium text-lg"
            >
              Raise a Query <ArrowRight className="h-5 w-5" />
            </Link>
            
            <a 
              href="tel:8840330283" 
              className="flex items-center justify-center w-full gap-2 border-2 border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium text-lg group"
            >
              <PhoneCall className="h-5 w-5 text-[#001f3f] group-hover:scale-110 transition-transform" />
              <span>Call Support (8840330283)</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};