"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/category-page/ProductGrid";
import type { SaleProduct, SaleBanner } from "@/lib/sale/get-sale-data";
import { getCdnUrl } from "@/lib/image-utils";

interface SaleSectionClientProps {
  products: SaleProduct[];
  banners: SaleBanner[];
}

export function SaleSectionClient({ products, banners }: SaleSectionClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const saleBanner = banners[0]; // show the first active sale banner

  return (
    <section
      id="sale-section"
      style={{
        background: "linear-gradient(135deg, #fff5f5 0%, #fff8f6 60%, #fffbf0 100%)",
        padding: "48px 0 56px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background blob */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: 20,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Limited Time
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(22px, 3.5vw, 34px)",
                fontWeight: 800,
                color: "#111",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              🔥 Sale — Grab Before It&apos;s Gone
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6, marginBottom: 0 }}>
              Handpicked deals on in-stock products. Limited quantities available.
            </p>
          </div>

          <Link
            href="/sale"
            style={{
              flexShrink: 0,
              background: "linear-gradient(135deg, #dc2626, #b91c1c)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 22px",
              borderRadius: 10,
              textDecoration: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(220,38,38,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
          >
            See All Deals →
          </Link>
        </div>

        {/* Sale banner (if one is configured with bannerType='sale') */}
        {saleBanner && (
          <Link href={saleBanner.url} style={{ display: "block", marginBottom: 28 }}>
            <div
              style={{
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                height: "clamp(120px, 22vw, 240px)",
                boxShadow: "0 8px 30px rgba(220,38,38,0.15)",
              }}
            >
              <Image
                src={getCdnUrl(saleBanner.imageUrl)}
                alt={saleBanner.headline}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 1280px"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, transparent 60%)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 32px",
                }}
              >
                <div>
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "clamp(18px, 3vw, 30px)",
                      fontWeight: 800,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {saleBanner.headline}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, margin: "6px 0 16px" }}>
                    {saleBanner.subheadline}
                  </p>
                  <span
                    style={{
                      background: "#fff",
                      color: "#dc2626",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "8px 20px",
                      borderRadius: 8,
                      display: "inline-block",
                    }}
                  >
                    {saleBanner.ctaText}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Products horizontal scroll */}
        <ProductGrid 
          products={products.map((product) => ({
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
          listId="homepage_sale_section"
          listName="Homepage Sale Section"
        />
      </div>
    </section>
  );
}
