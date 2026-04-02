'use client';

import { useEffect, useRef } from "react";
import { BestsellerCard } from "./bestseller-card";

interface BestsellerCarouselClientProps {
  initialProducts: any[];
}

export function BestsellerCarouselClient({ initialProducts }: BestsellerCarouselClientProps) {
  const bestsellerRef = useRef<HTMLElement>(null);
  const hasShownConfetti = useRef(false);

  useEffect(() => {
    sessionStorage.removeItem("bestsellerConfettiFired");
  }, []);

  useEffect(() => {
    const hasFired = sessionStorage.getItem("bestsellerConfettiFired");
    hasShownConfetti.current = hasFired === "true";
  }, []);

  useEffect(() => {
    const el = bestsellerRef.current;
    if (!el || initialProducts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || hasShownConfetti.current) return;

        hasShownConfetti.current = true;
        sessionStorage.setItem("bestsellerConfettiFired", "true");

        const canvas = document.createElement("canvas");
        Object.assign(canvas.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: "99999",
        });
        document.body.appendChild(canvas);

        import("canvas-confetti").then(({ default: confetti }) => {
          const fire = confetti.create(canvas, { resize: true, useWorker: true });
          fire({ particleCount: 60, angle: 60, spread: 55, startVelocity: 45, origin: { x: 0, y: 0.5 }, colors: ["#FFD700", "#FFF5AE", "#FFB100"] });
          fire({ particleCount: 60, angle: 120, spread: 55, startVelocity: 45, origin: { x: 1, y: 0.5 }, colors: ["#FFD700", "#FFF5AE", "#FFB100"] });
          setTimeout(() => canvas.remove(), 3000);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [initialProducts]);

  return (
    <section
      ref={bestsellerRef}
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url("/bestSellerBanner.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "520px",
      }}
    >
      {/* ── Rope SVG overlay ── */}
      <div className="absolute top-0 left-0 w-full pointer-events-none z-10" style={{ height: 200 }}>
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* left rope from corner */}
          <path
            d="M0,0 Q120,60 200,30 Q280,0 360,40"
            fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.9"
          />
          {/* right rope from corner */}
          <path
            d="M1440,0 Q1320,60 1240,30 Q1160,0 1080,40"
            fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.9"
          />

          {/* left hanging ornaments */}
          <g className="ornament-sway" style={{ transformOrigin: "80px 10px" }}>
            <line x1="80" y1="10" x2="80" y2="90" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <circle cx="80" cy="93" r="4" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity="0.8" />
            <line x1="80" y1="97" x2="80" y2="120" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <path d="M80,120 L74,140 L80,155 L86,140 Z" fill="#C9A84C" opacity="0.9" />
            <path d="M80,118 L76,113 L80,110 L84,113 Z" fill="#C9A84C" opacity="0.9" />
          </g>

          <g className="ornament-sway" style={{ transformOrigin: "200px 30px", animationDelay: "0.5s" }}>
            <line x1="200" y1="30" x2="200" y2="80" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <circle cx="200" cy="83" r="3.5" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity="0.8" />
            <line x1="200" y1="87" x2="200" y2="103" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <path d="M200,103 L195,117 L200,128 L205,117 Z" fill="#C9A84C" opacity="0.9" />
            <path d="M200,101 L197,97 L200,94 L203,97 Z" fill="#C9A84C" opacity="0.9" />
          </g>

          <g className="ornament-sway" style={{ transformOrigin: "340px 42px", animationDelay: "1s" }}>
            <line x1="340" y1="42" x2="340" y2="70" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <circle cx="340" cy="73" r="3" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity="0.8" />
            <line x1="340" y1="76" x2="340" y2="88" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <path d="M340,88 L336,98 L340,106 L344,98 Z" fill="#C9A84C" opacity="0.9" />
            <path d="M340,86 L337,83 L340,80 L343,83 Z" fill="#C9A84C" opacity="0.9" />
          </g>

          {/* right hanging ornaments */}
          <g className="ornament-sway" style={{ transformOrigin: "1360px 10px", animationDelay: "0.3s" }}>
            <line x1="1360" y1="10" x2="1360" y2="90" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <circle cx="1360" cy="93" r="4" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity="0.8" />
            <line x1="1360" y1="97" x2="1360" y2="120" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <path d="M1360,120 L1354,140 L1360,155 L1366,140 Z" fill="#C9A84C" opacity="0.9" />
            <path d="M1360,118 L1356,113 L1360,110 L1364,113 Z" fill="#C9A84C" opacity="0.9" />
          </g>

          <g className="ornament-sway" style={{ transformOrigin: "1240px 30px", animationDelay: "0.8s" }}>
            <line x1="1240" y1="30" x2="1240" y2="80" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <circle cx="1240" cy="83" r="3.5" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity="0.8" />
            <line x1="1240" y1="87" x2="1240" y2="103" stroke="#C9A84C" strokeWidth="1.5" opacity="0.85" />
            <path d="M1240,103 L1235,117 L1240,128 L1245,117 Z" fill="#C9A84C" opacity="0.9" />
            <path d="M1240,101 L1237,97 L1240,94 L1243,97 Z" fill="#C9A84C" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* ── Title ── */}
      <div className="relative z-20 flex justify-center pt-4 pb-2 sm:pt-8 sm:pb-6 mt-5">
        <h2
          className="bestseller-title text-[48px] sm:text-[56px] lg:text-[64px] font-bold text-center leading-none"
          style={{ fontFamily: "var(--font-agbalumo)" }}
        >
          Bestseller
        </h2>
      </div>

      {/* ── Framed scrollable cards area ── */}
      <div className="relative z-20 px-4 sm:px-8 lg:px-16 pb-6 sm:pb-14">
        <div
          className="relative rounded-2xl sm:rounded-3xl p-[2px]"
          style={{
            // background: "linear-gradient(135deg, #C9A84C 0%, #F0D080 40%, #C9A84C 60%, #A07830 100%)",
            boxShadow: "0 0 0 1px rgba(201,168,76,0.3), 0 8px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div
            className="rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{ background: "rgba(10, 60, 50, 0.45)", backdropFilter: "blur(2px)" }}
          >
            {/* inner gold inset border */}
            <div
              className="bs-frame-border rounded-xl sm:rounded-2xl overflow-x-auto hide-scrollbar py-6 px-4 sm:px-6 lg:px-8"
              style={{ border: "10px solid rgba(201,168,76,0.5)" }}
            >
              <div className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 pb-2" style={{ width: "max-content" }}>
                {initialProducts.map((product: any) => (
                  <div
                    key={product._id}
                    className="w-[160px] sm:w-[200px] lg:w-[240px] flex-shrink-0"
                  >
                    <BestsellerCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BestsellerStyle />
    </section>
  );
}

function BestsellerStyle() {
  return (
    <style>{`
      .bestseller-title {
        background: linear-gradient(100deg, #ffd700 10%, #fff5ae 35%, #ffb100 55%, #fffbe3 72%, #ffd700 88%, #ffb100 100%);
        background-size: 300% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: bs-gold 3.5s linear infinite alternate;
        filter: drop-shadow(0 2px 8px rgba(255,215,0,0.5)) drop-shadow(0 0 28px rgba(255,180,0,0.35));
      }
      @keyframes bs-gold {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      .ornament-sway {
        animation: sway 3.5s ease-in-out infinite alternate;
        transform-box: fill-box;
      }
      @keyframes sway {
        0% { transform: rotate(-8deg); }
        100% { transform: rotate(8deg); }
      }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @media (min-width: 640px) {
        .bs-frame-border { border-width: 15px; }
      }
    `}</style>
  );
}
