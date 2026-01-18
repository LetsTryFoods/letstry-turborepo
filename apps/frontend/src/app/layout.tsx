import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Agbalumo } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/providers/toast-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { RecaptchaProvider } from "@/components/recaptcha-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TopBanner } from "@/components/top-banner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { GuestSessionManager } from "@/components/guest/GuestSessionManager";
import { CartContainer } from "@/components/cart-drawer/CartContainer";
import { SearchOverlay } from "@/components/search-overlay";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/analytics/google-tag-manager";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const agbalumo = Agbalumo({
  variable: "--font-agbalumo",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Let's Try",
  description: "Let's Try E-commerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  
  return (
    <html lang="en">
      <head>
        <Script
          data-partytown-config
          dangerouslySetInnerHTML={{
            __html: `
              partytown = {
                forward: ['dataLayer.push']
              };
            `,
          }}
        />
        <Script src="/~partytown/partytown.js" />
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${agbalumo.variable} antialiased`}
      >
        {gtmId && <GoogleTagManagerNoscript gtmId={gtmId} />}
        <QueryProvider>
          <RecaptchaProvider>
            <AuthProvider>
              <Suspense fallback={null}>
                <PageViewTracker />
              </Suspense>
              <TopBanner />
              <Navbar />
              <SearchOverlay />
              <GuestSessionManager />
              <CartContainer />
              {children}
              <ToastProvider />
              <Footer />
            </AuthProvider>
          </RecaptchaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
