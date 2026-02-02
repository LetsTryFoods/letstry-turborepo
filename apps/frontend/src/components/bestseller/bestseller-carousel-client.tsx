'use client';

import { useEffect, useRef } from "react";
import { BestsellerCard } from "./bestseller-card";

interface BestsellerCarouselClientProps {
  initialProducts: any[];
}

export function BestsellerCarouselClient({ initialProducts }: BestsellerCarouselClientProps) {
  const bestsellerRef = useRef<HTMLElement>(null);
  const confettiContainerRef = useRef<HTMLDivElement>(null);
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
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
        if (!visible || hasShownConfetti.current) return;

        const canvas = document.createElement("canvas");
        Object.assign(canvas.style, {
          position: "absolute",
          top: "-120px",
          left: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: "50",
        });

        if (confettiContainerRef.current) {
          confettiContainerRef.current.appendChild(canvas);
        }

        hasShownConfetti.current = true;
        sessionStorage.setItem("bestsellerConfettiFired", "true");

        import("canvas-confetti").then(({ default: confetti }) => {
          const myConfetti = confetti.create(canvas, {
            resize: true,
            useWorker: true,
          });

          setTimeout(() => {
            myConfetti({
              particleCount: 180,
              spread: 100,
              startVelocity: 25,
              ticks: 90,
              origin: { y: 0.4 },
            });

            setTimeout(() => {
              if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
              }
            }, 2200);
          }, 50);
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
      className="relative mt-6 px-4 sm:px-6 lg:px-8 pt-2 pb-8 sm:pb-12 md:pb-14 lg:pb-16 overflow-hidden"
      style={{
        backgroundImage: 'url(https://d11a0m43ek7ap8.cloudfront.net/backgroundUpdate.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div
        ref={confettiContainerRef}
        className="absolute inset-0 pointer-events-none z-50"
      />

      <div className="relative z-10">
        <div className="flex justify-center items-center mb-4 sm:mb-8">
          <div className="festival-heading-wrap relative inline-block">
            <div className="confetti-burst absolute inset-0 z-0 pointer-events-none" />
            <h2
              className="festival-heading text-[40px] sm:text-[44px] lg:text-[56px] font-bold text-center py-2"
              style={{
                fontFamily: "var(--font-agbalumo)",
                borderRadius: "12px",
                marginBottom: 0,
                position: "relative",
                zIndex: 4,
              }}
            >
              Bestseller
            </h2>
          </div>
        </div>

        <div className="container relative mx-auto">
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 sm:gap-3 md:gap-6 lg:gap-8 px-1 sm:px-2 lg:px-8 pb-4">{initialProducts.map((product: any) => (
              <div
                key={product._id}
                className="min-w-[120px] sm:min-w-[180px] lg:min-w-[235px]"
              >
                <BestsellerCard product={product} />
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      <FestivalStyle />
    </section>
  );
}

function FestivalStyle() {
  return (
    <style>{`
      .festival-heading {
        background: linear-gradient(
          100deg,
          #ffd700 15%,
          #fff5ae 33%,
          #ffb100 54%,
          #fffbe3 70%,
          #ffd700 85%,
          #ffb100 100%
        );
        background-size: 300% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
        animation: festival-gold-gradient 3.7s linear infinite alternate;
        filter: drop-shadow(0 2px 6px #ffe08273) drop-shadow(0 0 32px #ffd60066);
        position: relative;
      }
      @keyframes festival-gold-gradient {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      .festival-heading::after {
        content: '';
        pointer-events: none;
        position: absolute;
        left: 2%;
        top: 5%;
        width: 96%;
        height: 94%;
        background: url('data:image/svg+xml;utf8,<svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="44" cy="18" r="2" fill="white" opacity="0.76"/><circle cx="70" cy="33" r="1.5" fill="white" opacity="0.6"/><circle cx="155" cy="20" r="1.3" fill="white" opacity="0.56"/><circle cx="182" cy="45" r="1.7" fill="white" opacity="0.56"/><circle cx="147" cy="41" r="1" fill="white" opacity="0.5"/><circle cx="101" cy="13" r="1.4" fill="white" opacity="0.4"/></svg>');
        background-repeat: no-repeat;
        background-size: cover;
        animation: sparkle-float 2.4s linear infinite;
        z-index: 15;
        opacity: 0.42;
        mix-blend-mode: lighten;
      }
      @keyframes sparkle-float {
        0% { background-position: 0% 0%; opacity: 0.32;}
        25% { opacity: 0.75; }
        80% { opacity: 0.42;}
        100% { background-position: 60px 10px; opacity: 0.32;}
      }
      .confetti-burst {
        width: 100%;
        height: 100%;
        background: url("data:image/svg+xml,%3Csvg width='250' height='70' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='white' stroke-width='2'%3E%3Ccircle cx='20' cy='10' r='1'/%3E%3Ccircle cx='60' cy='20' r='1.2'/%3E%3Ccircle cx='100' cy='5' r='0.8'/%3E%3Ccircle cx='160' cy='15' r='1.5'/%3E%3Ccircle cx='200' cy='25' r='1.1'/%3E%3Ccircle cx='230' cy='10' r='1.4'/%3E%3C/g%3E%3C/svg%3E") no-repeat center;
        background-size: 220px auto;
        opacity: 0;
        animation: confettiPop 1.4s ease-out forwards;
        z-index: 2;
      }
      @keyframes confettiPop {
        0% {
          transform: scale(0.7) translateY(20px);
          opacity: 0;
        }
        40% {
          opacity: 1;
        }
        100% {
          transform: scale(1) translateY(0px);
          opacity: 0.85;
        }
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>
  );
}
