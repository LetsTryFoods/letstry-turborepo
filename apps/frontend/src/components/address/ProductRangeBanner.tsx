import Link from "next/link";
import Image from "next/image";
import { getBestsellerProducts } from "@/lib/product";
import { getCdnUrl } from "@/lib/image-utils";

export async function ProductRangeBanner() {
  const products = await getBestsellerProducts("best-selling", 5);

  const productImages = products
    .filter((p) => p.defaultVariant?.thumbnailUrl)
    .slice(0, 5)
    .map((p) => ({
      src: getCdnUrl(p.defaultVariant!.thumbnailUrl),
      name: p.name,
    }));

  return (
    <section className="w-full pb-8 md:pb-10 mb-4 md:mb-6 rounded-lg overflow-hidden">
      <Link
        href="/"
        className="flex flex-row items-stretch w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(120deg, #005ea8 0%, #004d8c 55%, #003a6e 100%)",
          minHeight: "140px",
          textDecoration: "none",
          borderRadius: "0px",
        }}
      >
        {/* ── Left: text ── */}
        <div className="flex flex-col justify-center px-4 sm:px-6 md:px-10 py-5 md:py-7 flex-1 min-w-0 z-10">
          <span
            className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#93c9f0" }}
          >
            Explore our products
          </span>
          <h2
            className="font-extrabold leading-tight mb-1.5"
            style={{
              color: "#ffffff",
              fontSize: "clamp(15px, 3.5vw, 28px)",
              whiteSpace: "wrap",
            }}
          >
            See Our Whole Range
          </h2>
          <p
            className="leading-relaxed mb-4"
            style={{
              color: "#b8dcf5",
              fontSize: "clamp(10px, 2vw, 14px)",
            }}
          >
            No palm oil · No maida
          </p>
          <span
            className="inline-flex items-center gap-1.5 self-start rounded-full font-semibold"
            style={{
              background: "#ffffff",
              color: "#005ea8",
              fontSize: "clamp(10px, 2vw, 14px)",
              padding: "6px 14px",
            }}
          >
            Shop Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              width={12}
              height={12}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        </div>

        {/* ── Right: product images ── */}
        {productImages.length > 0 && (
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{ width: "clamp(140px, 44%, 400px)" }}
          >
            {/* left fade blends images into the blue */}
            <div
              className="absolute inset-y-0 left-0 z-10 pointer-events-none"
              style={{
                width: "40%",
                background:
                  "linear-gradient(to right, #004d8c 10%, transparent 100%)",
              }}
            />

            {/* product images anchored to the bottom */}
            <div className="absolute inset-0 flex items-end justify-center pb-0">
              <div
                className="flex items-end"
                style={{ gap: "clamp(2px, 1vw, 8px)" }}
              >
                {productImages.map((img, i) => {
                  const rotations = [-10, -4, 2, 8, 14];
                  const tilt = rotations[i] ?? 0;
                  return (
                    <div
                      key={i}
                      style={{
                        transform: `rotate(${tilt}deg)`,
                        transformOrigin: "bottom center",
                        filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.5))",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={img.src}
                        alt={img.name}
                        width={65}
                        height={100}
                        className="object-contain"
                        style={{
                          height: "clamp(85px, 13vw, 140px)",
                          width: "auto",
                          display: "block",
                        }}
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Link>
    </section>
  );
}
