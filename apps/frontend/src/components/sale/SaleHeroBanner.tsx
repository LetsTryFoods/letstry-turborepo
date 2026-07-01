import Image from "next/image";
import Link from "next/link";

export const SaleHeroBanner = () => {
  return (
    <div style={{ position: "relative", display: "block" }}>
      <Link href="/sale" style={{ display: "block" }}>
        <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
          <Image
            src="/sale-banner.png"
            alt="Flat 60% Off on Limited Products — Shop Now"
            width={1920}
            height={600}
            className="w-full h-auto object-cover"
            priority
            sizes="100vw"
          />
          {/* Subtle hover overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              transition: "background 0.2s",
            }}
            className="sale-hero-overlay"
          />
        </div>
      </Link>
    </div>
  );
};
