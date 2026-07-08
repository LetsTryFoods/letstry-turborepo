import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SaleProductGrid } from "@/components/landing-sale/sale-product-grid";
import { getSaleProductsFirstPage } from "@/lib/landing-sale/get-sale-data";

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Sale — Handpicked Deals on Healthy Snacks | Let's Try Foods",
  description:
    "Shop limited-time sale deals on Let's Try Foods healthy snacks. Grab your favourites at discounted prices — no palm oil, no maida, delivered across India.",
  alternates: {
    canonical: `${SITE_URL}/landing-sale`,
  },
  openGraph: {
    title: "Sale — Handpicked Deals | Let's Try Foods",
    description:
      "Limited-time discounts on healthy Indian snacks. No palm oil, no maida. Shop now before stock runs out.",
    url: `${SITE_URL}/landing-sale`,
    type: "website",
    siteName: "Let's Try Foods",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sale — Handpicked Deals | Let's Try Foods",
    description:
      "Limited-time discounts on healthy Indian snacks. Shop now before stock runs out.",
  },
};


export const revalidate = 600;

export default async function LandingSalePage() {
  const initialData = await getSaleProductsFirstPage(24);

  return (
    <main>
      {/* Static hero banners — desktop & mobile */}
      {/* aspect-ratio prevents layout shift before image loads (fixes CLS) */}
      {/* <div className="w-full relative">
        <Image
          src="/saller_landing.png"
          alt="Sale Banner"
          width={1920}
          height={600}
          className="hidden md:block w-full h-auto object-cover"
          style={{ aspectRatio: "1920/600" }}
          priority
          fetchPriority="high"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        <Image
          src="/saller_mobile_landing.png"
          alt="Sale Banner"
          width={828}
          height={420}
          className="block md:hidden w-full h-auto object-cover"
          style={{ aspectRatio: "828/420" }}
          priority
          fetchPriority="high"
          sizes="100vw"
        />
      </div> */}

      {/* Products grid */}
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "48px 24px 72px",
        }}
      >
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 28, fontSize: 13, color: "#6b7280" }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span style={{ color: "#111", fontWeight: 600 }}>Sale</span>
        </nav>

        {/* Pass server-fetched page 1 — renders instantly, client hydrates for scroll */}
        <SaleProductGrid
          initialItems={initialData?.items}
          initialMeta={initialData?.meta}
        />
      </section>
    </main>
  );
}
