import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSaleProducts, getSaleBanners } from "@/lib/sale/get-sale-data";
import { ProductGrid } from "@/components/category-page/ProductGrid";
import { getCdnUrl } from "@/lib/image-utils";

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Sale — Handpicked Deals on Healthy Snacks | Let's Try Foods",
  description:
    "Shop limited-time sale deals on Let's Try Foods healthy snacks. Grab your favourites at discounted prices — no palm oil, no maida, delivered across India.",
  alternates: {
    canonical: `${SITE_URL}/sale`,
  },
  openGraph: {
    title: "Sale — Handpicked Deals | Let's Try Foods",
    description:
      "Limited-time discounts on healthy Indian snacks. No palm oil, no maida. Shop now before stock runs out.",
    url: `${SITE_URL}/sale`,
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

export default async function SalePage() {
  const [products, banners] = await Promise.all([
    getSaleProducts(),
    getSaleBanners(),
  ]);

  const heroBanner = banners[0];

  return (
    <main>
      {/* Hero banner for the sale page */}
      {heroBanner ? (
        <div
          style={{
            position: "relative",
            height: "clamp(180px, 35vw, 420px)",
            overflow: "hidden",
          }}
        >
          <Image
            src={getCdnUrl(heroBanner.imageUrl)}
            alt={heroBanner.headline}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 65%)",
              display: "flex",
              alignItems: "center",
              padding: "0 clamp(20px, 5vw, 80px)",
            }}
          >
            <div>
              <span
                style={{
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 14px",
                  borderRadius: 20,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginBottom: 12,
                }}
              >
                Limited Time
              </span>
              <h1
                style={{
                  color: "#fff",
                  fontSize: "clamp(24px, 4.5vw, 52px)",
                  fontWeight: 900,
                  margin: "0 0 8px",
                  lineHeight: 1.15,
                }}
              >
                {heroBanner.headline}
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "clamp(13px, 1.8vw, 18px)",
                  margin: "0 0 20px",
                }}
              >
                {heroBanner.subheadline}
              </p>
              <span
                style={{
                  background: "#fff",
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: 14,
                  padding: "10px 24px",
                  borderRadius: 10,
                  display: "inline-block",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                }}
              >
                {heroBanner.ctaText}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Fallback hero when no banner is configured */
        <div className="w-full relative">
          <Image
            src="/sale-banner.png"
            alt="Sale Banner"
            width={1920}
            height={600}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      )}

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

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 20, color: "#6b7280", fontWeight: 600 }}>
              No sale items right now. Check back soon!
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: 20,
                background: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 28px",
                borderRadius: 10,
                textDecoration: "none",
              }}
            >
              Shop All Products
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2
                style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}
              >
                All Sale Items
              </h2>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            </div>

              <ProductGrid 
                products={[...products]
                  .sort((a, b) => {
                    const discountA = a.defaultVariant?.discountPercent || 0;
                    const discountB = b.defaultVariant?.discountPercent || 0;
                    return discountB - discountA;
                  })
                  .map((product) => ({
                  id: product._id,
                  name: product.name,
                  slug: product.slug,
                  image: product.defaultVariant?.thumbnailUrl || "",
                  price: product.defaultVariant?.price || 0,
                  mrp: product.defaultVariant?.mrp,
                  variants: product.variants.map((v) => ({
                    id: v._id,
                    weight: v.packageSize || "",
                    price: v.price,
                    mrp: v.mrp,
                    isOutOfStock: v.availabilityStatus !== "in_stock",
                  })),
                  badge: { label: "🔥 SALE", variant: "trending" as const },
                }))}
                listId="sale_page_products"
                listName="Sale Page"
              />
            </>
          )}
        </section>
    </main>
  );
}
