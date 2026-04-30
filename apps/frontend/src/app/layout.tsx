import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Agbalumo } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/providers/toast-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { RecaptchaProvider } from "@/components/recaptcha-provider";
import { QueryProvider } from "@/providers/query-provider";
import { NotificationBanner, HomeAlertModal } from "@/components/notification-banner";
import { TopBanner } from "@/components/top-banner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { GuestSessionManager } from "@/components/guest/GuestSessionManager";
import { CartContainer } from "@/components/cart-drawer/CartContainer";
import { SearchOverlay } from "@/components/search-overlay";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/analytics/google-tag-manager";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { WebVitalsTracker } from "@/components/analytics/web-vitals";
import { SpinWheelContainer } from "@/components/spin-wheel/SpinWheelContainer";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const agbalumo = Agbalumo({
  variable: "--font-agbalumo",
  subsets: ["latin"],
  weight: "400",
  display: 'swap',
  preload: true,
});

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Let's Try Foods",
    template: "%s | Let's Try Foods",
  },
  description: "Let's Try Foods — healthy Indian snacks with no palm oil and no maida.",
  // Search-engine ownership verification.
  // Pull values from env vars so they can be set per-environment without a
  // code change. Leaving them unset is safe — Next omits the meta tag when
  // the value is undefined.
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
        ? { 'yandex-verification': process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION
        ? { 'p:domain_verify': process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION }
        : {}),
    },
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}#organization`,
  name: "Let's Try Foods",
  alternateName: ["Let's Try", 'LetsTry Foods'],
  legalName: 'Earth Crust Pvt Ltd',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.webp`,
    width: 120,
    height: 120,
  },
  image: `${SITE_URL}/logo.webp`,
  description:
    "Let's Try Foods is a Delhi-based Indian healthy-snacks brand. Every product is made without palm oil; most are also made without maida. The cookies range is made without refined sugar.",
  slogan: 'Healthy Indian snacks, no palm oil.',
  foundingDate: '2021',
  foundingLocation: {
    '@type': 'Place',
    name: 'Delhi, India',
  },
  knowsAbout: [
    'palm-oil-free Indian snacks',
    'no-maida namkeen',
    'healthy Indian cookies',
    'roasted makhana',
    'traditional Indian namkeen',
    'vrat / fasting snacks',
  ],
  areaServed: { '@type': 'Country', name: 'India' },
  sameAs: [
    'https://www.facebook.com/p/Lets-Try-100067844378739/',
    'https://www.instagram.com/letstry_foods/',
  ],
  identifier: 'U15549DL2020PTC365385',
  taxID: 'U15549DL2020PTC365385',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '329, 1st Floor, Indra Vihar',
    addressLocality: 'Delhi',
    addressRegion: 'Delhi',
    postalCode: '110009',
    addressCountry: 'IN',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-9654-932-262',
      email: 'ecom@earthcrust.co.in',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    {
      '@type': 'ContactPoint',
      email: 'corporate@letstryfoods.com',
      contactType: 'sales',
      areaServed: 'IN',
    },
    {
      '@type': 'ContactPoint',
      email: 'export@earthcrust.co.in',
      contactType: 'sales',
      areaServed: 'Worldwide',
    },
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  url: SITE_URL,
  name: "Let's Try Foods",
  publisher: { '@id': `${SITE_URL}#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
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
        <link rel="preconnect" href="https://cdn.krishnaseth.xyz" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://admin-api.krsna.site" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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
              <WebVitalsTracker />
              <NotificationBanner />
              <HomeAlertModal />
              <TopBanner />
              <Navbar />
              <SearchOverlay />
              <GuestSessionManager />
              <CartContainer />
              {/* <SpinWheelContainer /> */}
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
