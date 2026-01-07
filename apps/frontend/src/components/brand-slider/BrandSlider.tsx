"use client";

interface Brand {
  name: string;
  img: string;
}

const VITE_API_IMAGE_URL = process.env.NEXT_PUBLIC_API_IMAGE_URL || "";

const brands: Brand[] = [
  { name: "Amazon", img: `${VITE_API_IMAGE_URL}/images/amazon.webp` },
  { name: "BigBasket", img: `${VITE_API_IMAGE_URL}/images/bigbasket.webp` },
  { name: "Blinkit", img: `${VITE_API_IMAGE_URL}/images/blinkit.webp` },
  { name: "Flipkart", img: `${VITE_API_IMAGE_URL}/images/flipkart.webp` },
  { name: "Instamart", img: `${VITE_API_IMAGE_URL}/images/instamart.webp` },
  { name: "Reliance", img: `${VITE_API_IMAGE_URL}/images/reliance.webp` },
  { name: "Zepto", img: `${VITE_API_IMAGE_URL}/images/zepto.webp` },
  { name: "DMart", img: `${VITE_API_IMAGE_URL}/images/dmart.webp` },
  { name: "MilkBasket", img: `${VITE_API_IMAGE_URL}/images/milkbasket.webp` },
];

interface LogoProps {
  name: string;
  img: string;
  i: number | string;
}

const Logo = ({ name, img, i }: LogoProps) => (
  <div key={`${name}-${i}`} className="brand-slide">
    <img src={img} alt={name} loading="lazy" className="brand-img" draggable={false} />
  </div>
);

const BrandSlider = () => (
  <div className="bg-white py-2 lg:py-4">
    <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black mb-4 md:mb-8 lg:mb-10 mx-4 md:mx-8">
      Also available on
    </h2>

    {/* Control speed here; smaller = faster */}
    <div className="marquee-outer" style={{ "--speed": "12s" } as React.CSSProperties}>
      {/* Lane A */}
      <div className="lane-wrap">
        <div className="lane-mover lane-a">
          {brands.map((b, i) => (
            <Logo key={i} {...b} i={i} />
          ))}
          {brands.map((b, i) => (
            <Logo key={i} {...b} i={`dup-${i}`} />
          ))}
        </div>
      </div>
      {/* Lane B */}
      <div className="lane-wrap">
        <div className="lane-mover lane-b">
          {brands.map((b, i) => (
            <Logo key={i} {...b} i={i} />
          ))}
          {brands.map((b, i) => (
            <Logo key={i} {...b} i={`dup-${i}`} />
          ))}
        </div>
      </div>
    </div>

    <style>{`
      .marquee-outer {
        position: relative;
        overflow: hidden;
        width: 100%;
        background: #fff;
        height: clamp(40px, 10vw, 120px);
        padding: 0.5rem 0;
      }

      /* Each lane is vertically centered by its wrapper (no translateY in animation) */
      .lane-wrap {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        pointer-events: none;
      }

      /* The mover is the element that actually scrolls horizontally */
      .lane-mover {
        display: inline-flex;
        gap: clamp(12px, 4vw, 80px);
        white-space: nowrap;
        width: max-content;      /* intrinsic width based on children */
        will-change: transform;
        transform: translateX(0);
        animation: marquee-move var(--speed, 12s) linear infinite;
      }

      /* Lane B starts already shifted by 50% of its own width.
         Important: we use animation-name only here with from/to overriding translateX only,
         so the initial transform translateX(-50%) survives and creates the end-to-end chain. */
      .lane-b {
        transform: translateX(-50%);
        animation-name: marquee-move;
        animation-duration: var(--speed, 12s);
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      /* Only animate translateX, never override other transforms */
      @keyframes marquee-move {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      .brand-slide {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .brand-img {
        height: 30px;
        max-width: 140px;
        width: auto;
        object-fit: contain;
        pointer-events: none;
      }

      @media (min-width: 640px) { .brand-img { height: 40px; } }
      @media (min-width: 768px) { .brand-img { height: 70px; } }
      @media (min-width: 1024px){ .brand-img { height: 100px; } }
    `}</style>
  </div>
);

export default BrandSlider;
