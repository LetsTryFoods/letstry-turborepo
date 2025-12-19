"use client";

import { useEffect } from 'react';
import Script from 'next/script';

export function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  useEffect(() => {
    if (siteKey) {
      const badge = document.querySelector('.grecaptcha-badge') as HTMLElement;
      if (badge) {
        badge.style.zIndex = '9999';
      }
    }
  }, [siteKey]);

  return (
    <>
      {siteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="afterInteractive"
        />
      )}
      {children}
    </>
  );
}
