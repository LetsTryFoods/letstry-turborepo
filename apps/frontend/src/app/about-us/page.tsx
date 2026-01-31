"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { GoArrowRight } from "react-icons/go";

const NEXT_PUBLIC_API_IMAGE_URL =
  process.env.NEXT_PUBLIC_API_IMAGE_URL_OLD || "";
const FALLBACK_IMAGE = "/placeholder-image.svg";

interface Dash {
  x: number;
  y: number;
  angle: number;
  i: number;
}

const AnimatedCurvedArrow = () => {
  const [dashes, setDashes] = useState<Dash[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const animateArrow = () => {
    const path = pathRef.current;
    if (!path) return;

    const dashCount = 35;
    const dashesArray: Dash[] = [];

    const length = path.getTotalLength();

    for (let i = 0; i < dashCount; i++) {
      const start = (i / dashCount) * length;
      const end = ((i + 0.5) / dashCount) * length;

      const p1 = path.getPointAtLength(start);
      const p2 = path.getPointAtLength(end);

      const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

      dashesArray.push({
        x: p1.x,
        y: p1.y,
        angle,
        i,
      });
    }

    setDashes([]);
    setTimeout(() => {
      setDashes(dashesArray);
    }, 50);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateArrow();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef}>
      <svg viewBox="0 0 400 150" className="lg:w-[430px] md:w-[300px] w-[150px]">
        <style>{`
          .dash {
            stroke: black;
            stroke-width: 3;
            opacity: 0;
            animation: appear 0.08s forwards;
          }
          @keyframes appear {
            to {
              opacity: 1;
            }
          }
        `}</style>

        <g transform="rotate(12, 200, 75) scale(1, -1) translate(0, -140)">
          <path
            ref={pathRef}
            d="M0,90 C100,-180 280,250 390,70"
            fill="none"
            stroke="transparent"
          />

          {dashes.map(({ x, y, angle, i }) => (
            <line
              key={i}
              x1={-4}
              y1={0}
              x2={4}
              y2={0}
              transform={`translate(${x}, ${y}) rotate(${angle})`}
              className="dash"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}

          {dashes.length > 0 && (() => {
            const last = dashes[dashes.length - 1];
            return (
              <g
                transform={`translate(${last.x}, ${last.y}) rotate(${last.angle})`}
                style={{
                  opacity: 0,
                  animation: 'appear 0.08s forwards',
                  animationDelay: `${dashes.length * 0.08}s`,
                }}
              >
                <polyline
                  points="0,-5 10,0 0,5"
                  fill="none"
                  stroke="black"
                  strokeWidth="3"
                />
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
};

const DecorativeDots = () => {
  const dots = [
    { x: 5, y: 15, size: 4, delay: 0 },
    { x: 15, y: 8, size: 3, delay: 0.1 },
    { x: 25, y: 20, size: 5, delay: 0.2 },
    { x: 85, y: 10, size: 4, delay: 0.3 },
    { x: 95, y: 18, size: 3, delay: 0.4 },
    { x: 10, y: 85, size: 4, delay: 0.5 },
    { x: 20, y: 75, size: 5, delay: 0.6 },
    { x: 90, y: 80, size: 4, delay: 0.7 },
    { x: 95, y: 90, size: 3, delay: 0.8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {dots.map((dot, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-gray-400"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: dot.delay, duration: 0.5 }}
        />
      ))}
    </div>
  );
};

const BadgeImages = ({ images }: { images: string[] }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6 mt-6 px-4">
      {images.map((src, index) => (
        <motion.div
          key={index}
          className="w-18 h-18 md:w-20 md:h-22 lg:w-24 lg:h-26"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <Image
            src={src}
            alt={`Quality badge ${index + 1}`}
            width={80}
            height={80}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_IMAGE;
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default function AboutUsPage() {
  const animatedRef = useRef(null);
  const inView = useInView(animatedRef, { once: true });

  const words = "Why to choose us?".split(" ");

  let wordImage = [
    `${NEXT_PUBLIC_API_IMAGE_URL}/Group523.png`,
    `${NEXT_PUBLIC_API_IMAGE_URL}/Group522.png`,
    `${NEXT_PUBLIC_API_IMAGE_URL}/Group486.png`,
    `${NEXT_PUBLIC_API_IMAGE_URL}/Group483.png`,
    `${NEXT_PUBLIC_API_IMAGE_URL}/Group481.png`,
    `${NEXT_PUBLIC_API_IMAGE_URL}/Group482.png`,
  ];

  const handleClick = () => {
    window.location.href = "/";
  };

  return (
    <main>
      <div className="justify-center items-center">
        <div className="lg:px-[160px] md:px-[40px] px-[20px] md:mx-4 lg:mx-2">
          <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-left mt-4 mb-[15px] md:mb-[20px] lg:mb-[30px]">
            About Us
          </h1>

          <div className="flex md:flex-row lg:mb-28 md:mb-16 lg:gap-6">
            <div className="relative w-full max-w-sm flex">
              <div className="hidden md:block relative w-full">
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/Front.webp`}
                  alt="About us front image"
                  width={400}
                  height={400}
                  className="absolute lg:w-full md:w-[270px] lg:mr-16 lg:max-w-xs lg:h-auto border-2 rounded-[15px] top-0 left-0 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/Front.webp`}
                  alt="About us overlay image"
                  width={180}
                  height={180}
                  className="absolute lg:w-[180px] md:w-[120px] border-8 border-black rounded-[15px] md:left-[55%] lg:left-[60%] top-[70px] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div className="block md:hidden relative">
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/Front.webp`}
                  alt="About us mobile image"
                  width={120}
                  height={120}
                  className="w-[120px] h-[120px] border-2 rounded-[15px] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/Front.webp`}
                  alt="About us mobile overlay"
                  width={50}
                  height={50}
                  className="absolute w-[50px] h-[50px] border-4 border-black rounded-[10px] lg:rounded-[15px] left-[100%] top-[50px] -translate-x-1/2 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </div>
            <div className="text-[12px] md:text-2xl lg:text-[26px] leading-relaxed text-black font-normal text-left lg:pt-[110px] md:pt-[70px] pt-[20px] lg:pl-24 w-full max-w-xl">
              When we found that our kid is only eating Snacks that were made
              with harmful ingredients. We started making Snacks in our Home by
              infusing <strong>high-quality ingredients.</strong>
            </div>
          </div>

          <div className="relative lg:h-[220px] md:h-[180px] h-[120px] lg:pb-0 pb-12 flex items-center justify-center lg:mt-[70px] md:mt-[60px] pr-0 md:pr-12">
            <DecorativeDots />
            <AnimatedCurvedArrow />
          </div>

          <div className="flex md:flex-row items-center md:gap-0 gap-6 -mt-16">
            <div className="text-[12px] md:text-2xl lg:text-[26px] leading-relaxed text-black font-normal text-left pb-4 w-[50%] md:w-[450px]">
              Soon in{" "}
              <strong>2021 launched &ldquo;Let&apos;s Try&rdquo;</strong> with
              the purpose to provide better products with high-quality
              ingredients.
            </div>
            <div className="w-[50%] lg:w-[390px] md:max-w-full h-auto md:mx-16">
              <Image
                src={`${NEXT_PUBLIC_API_IMAGE_URL}/Front.webp`}
                alt="Let's Try launch 2021"
                width={280}
                height={280}
                loading="lazy"
                className="border-2 w-[120px] md:w-[280px] md:max-h-full lg:ml-[150px] ml-[30px] md:ml-[40px] rounded-[15px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = FALLBACK_IMAGE;
                }}
              />
            </div>
          </div>

          <div className="flex mt-0 lg:mb-8">
            <div className="max-w-5xl text-[12px] md:text-2xl lg:text-[26px] leading-relaxed text-black text-left py-5">
              At Let&apos;s Try, we believe healthy snacking can be fun too. We
              follow traditional methods to make all our snacks, just like your
              grandma used to. We use 100% groundnut oil. No preservatives, No
              artificial flavors, or colors, no trans fats or cholesterol. We
              have a large variety of snacks, all of which have a unique taste
              and flavor. Our products are tastier and healthier than other junk
              food and can be consumed by anyone.
            </div>
          </div>
        </div>

        <section className="bg-[#FFDFAB6B] w-full py-8 md:py-10 lg:py-12">
          <div ref={animatedRef} className="w-full flex justify-center mb-4">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-center px-2 flex flex-wrap justify-center gap-x-3">
              {words.map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ y: -20, opacity: 0, filter: "blur(6px)" }}
                  animate={
                    inView ? { y: 0, opacity: 1, filter: "blur(0)" } : {}
                  }
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </h2>
          </div>
          <BadgeImages images={wordImage} />
        </section>

        <div className="flex justify-center px-4 mx-4 md:mx-8">
          <p className="max-w-4xl px-4 md:px-8 text-[12px] md:text-2xl lg:text-[26px] leading-relaxed text-black text-center my-8 lg:py-8 md:py-8">
            Here at Let&apos;s Try we believe that good snacks don&apos;t have
            to be expensive. Our prices fit almost any budget, so you can enjoy
            the convenience of home-delivered snacks, while still saving money.
          </p>
        </div>

        <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-center max-w-3xl mx-auto lg:mt-6 lg:mb-16 md:mb-8 px-4">
          Healthy snacking we&apos;re offering to our customers
        </h2>

        <div className="block lg:hidden md:hidden px-4 mt-6 flex flex-wrap gap-6 justify-center">
          <div className="w-[150px]">
            <article className="relative flex flex-col justify-between border border-[#AFADAD] rounded-[15px] h-[150px] p-3 overflow-hidden">
              <h3 className="text-[14px] text-black font-semibold">Namkeen</h3>
              <p className="text-[10px] text-black font-medium">
                Wholesome crunch in every bite—our healthy namkeen made in 100%
                groundnut oil.
              </p>
              <Link
                href="/namkeen"
                className="text-[12px] text-[#0C5273] no-underline font-medium flex items-center gap-2 lg:hover:underline"
              >
                Explore <GoArrowRight />
              </Link>
              <div className="absolute bottom-0 right-0 w-[60px] h-[60px] bg-[#F3F3F3] rounded-tl-full">
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/namkeen-DHF0X_sA.png`}
                  alt="Namkeen"
                  width={40}
                  height={40}
                  loading="lazy"
                  className="h-[40px] w-[40px] mt-3 ml-[17px] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </article>
          </div>

          <div className="w-[150px]">
            <article className="relative flex flex-col justify-between border border-[#AFADAD] rounded-[15px] h-[150px] p-3 overflow-hidden">
              <h3 className="text-[14px] text-black font-semibold">Cookies</h3>
              <p className="text-[10px] text-black font-medium">
                Deliciously light, naturally sweet—healthy cookies for every
                mindful munch.
              </p>
              <Link
                href="/cookies"
                className="text-[12px] text-[#0C5273] no-underline font-medium flex items-center gap-2 lg:hover:underline"
              >
                Explore <GoArrowRight />
              </Link>
              <div className="absolute bottom-0 right-0 w-[60px] h-[60px] bg-[#F3F3F3] rounded-tl-full">
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/cookies.webp`}
                  alt="Cookies"
                  width={40}
                  height={40}
                  className="h-[40px] w-[40px] mt-3 ml-[17px] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </article>
          </div>

          <div className="w-[150px] mx-auto">
            <article className="relative flex flex-col justify-between border border-[#AFADAD] rounded-[15px] h-[150px] p-3.5 overflow-hidden">
              <h3 className="text-[14px] text-black font-semibold">Munchies</h3>
              <p className="text-[10px] text-black font-medium">
                Snack smart with munchies that are big on taste and free from
                <br /> junk.
              </p>
              <Link
                href="/munchies"
                className="text-[12px] text-[#0C5273] no-underline font-medium flex items-center gap-2 lg:hover:underline"
              >
                Explore <GoArrowRight />
              </Link>
              <div className="absolute bottom-0 right-0 w-[60px] h-[60px] bg-[#F3F3F3] rounded-tl-full">
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/munchies.webp`}
                  alt="Munchies"
                  width={40}
                  height={40}
                  className="h-[40px] w-[40px] mt-3 ml-[17px] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </article>
          </div>
        </div>

        <div className="hidden lg:flex md:flex justify-center md:gap-4 lg:gap-10 mt-6 md:px-4 lg:px-20">
          <div className="w-full max-w-sm">
            <article className="relative flex flex-col border border-[#AFADAD] rounded-[15px] h-[280px] lg:p-6 md:p-3 overflow-hidden">
              <h3 className="text-3xl mb-4 text-black font-semibold">
                Namkeen
              </h3>
              <p className="md:text-[19px] lg:text-[18px] mb-12 text-black font-[600]">
                Wholesome crunch in every bite—our healthy namkeen made in 100%
                groundnut oil.
              </p>
              <Link
                href="/namkeen"
                className="text-xl text-[#0C5273] no-underline font-medium flex items-center gap-2 lg:hover:underline"
              >
                Explore <GoArrowRight />
              </Link>
              <div className="absolute bottom-0 right-0 lg:w-[193px] lg:h-[160px] md:w-[120px] md:h-[120px] bg-[#F3F3F3] rounded-tl-full">
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/namkeen-DHF0X_sA.png`}
                  alt="Namkeen"
                  width={120}
                  height={114}
                  className="lg:h-[114px] lg:w-[120px] md:w-[80px] md:h-[80px] lg:mt-7 lg:ml-[60px] md:ml-8 md:mt-7 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </article>
          </div>

          <div className="w-full max-w-sm">
            <article className="relative flex flex-col border border-[#AFADAD] rounded-[15px] h-[280px] lg:p-6 md:p-3 overflow-hidden">
              <h3 className="text-3xl mb-4 text-black font-semibold">
                Cookies
              </h3>
              <p className="md:text-[19px] lg:text-[18px] mb-12 text-black font-[600]">
                Deliciously light, naturally sweet—healthy cookies for every
                <br /> mindful munch.
              </p>
              <Link
                href="/cookies"
                className="text-xl text-[#0C5273] font-medium no-underline flex items-center gap-2 lg:hover:underline"
              >
                Explore <GoArrowRight />
              </Link>
              <div className="absolute bottom-0 right-0 lg:w-[193px] lg:h-[160px] md:w-[120px] md:h-[120px] bg-[#F3F3F3] rounded-tl-full">
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/cookies.webp`}
                  alt="Cookies"
                  width={120}
                  height={114}
                  className="lg:h-[114px] lg:w-[120px] md:w-[80px] md:h-[80px] lg:mt-7 lg:ml-[60px] md:ml-8 md:mt-7 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </article>
          </div>

          <div className="w-full max-w-sm">
            <article className="relative flex flex-col border border-[#AFADAD] rounded-[15px] h-[280px] lg:p-6 md:p-3 overflow-hidden">
              <h3 className="text-3xl mb-4 text-black font-semibold">
                Munchies
              </h3>
              <p className="md:text-[19px] lg:text-[18px] mb-12 text-black font-[600]">
                Snack smart with munchies that are big on taste and free from{" "}
                <br />
                junk.
              </p>
              <Link
                href="/munchies"
                className="text-xl text-[#0C5273] font-medium no-underline flex items-center gap-2 lg:hover:underline"
              >
                Explore <GoArrowRight />
              </Link>
              <div className="absolute bottom-0 right-0 lg:w-[193px] lg:h-[160px] md:w-[120px] md:h-[120px] bg-[#F3F3F3] rounded-tl-full">
                <Image
                  src={`${NEXT_PUBLIC_API_IMAGE_URL}/munchies.webp`}
                  alt="Munchies"
                  width={120}
                  height={114}
                  className="lg:h-[114px] lg:w-[120px] md:w-[80px] md:h-[80px] lg:mt-7 lg:ml-[60px] md:ml-8 md:mt-7 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </article>
          </div>
        </div>

        <div className="flex justify-center my-8 px-4">
          <button
            className="lg:w-full lg:max-w-xl md:w-full md:max-w-lg w-[300px] py-2.5 rounded-[10px] text-white text-[16px] md:text-2xl font-medium bg-[#0C5273] lg:hover:bg-[#09415b]"
            onClick={handleClick}
          >
            Explore more snacking options
          </button>
        </div>
      </div>
    </main>
  );
}
