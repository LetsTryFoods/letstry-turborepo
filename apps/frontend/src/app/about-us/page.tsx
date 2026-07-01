"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { GoArrowRight } from "react-icons/go";

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
      dashesArray.push({ x: p1.x, y: p1.y, angle, i });
    }
    setDashes([]);
    setTimeout(() => setDashes(dashesArray), 50);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animateArrow(); },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { if (containerRef.current) observer.unobserve(containerRef.current); };
  }, []);

  return (
    <div ref={containerRef} className="flex justify-center">
      <svg viewBox="0 0 400 150" className="lg:w-[430px] md:w-[300px] w-[150px]">
        <style>{`
          .dash { stroke: black; stroke-width: 3; opacity: 0; animation: appear 0.08s forwards; }
          @keyframes appear { to { opacity: 1; } }
        `}</style>
        <g transform="rotate(12, 200, 75) scale(1, -1) translate(0, -140)">
          <path ref={pathRef} d="M0,90 C100,-180 280,250 390,70" fill="none" stroke="transparent" />
          {dashes.map(({ x, y, angle, i }) => (
            <line key={i} x1={-4} y1={0} x2={4} y2={0}
              transform={`translate(${x}, ${y}) rotate(${angle})`}
              className="dash" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
          {dashes.length > 0 && (() => {
            const last = dashes[dashes.length - 1];
            return (
              <g transform={`translate(${last.x}, ${last.y}) rotate(${last.angle})`}
                style={{ opacity: 0, animation: "appear 0.08s forwards", animationDelay: `${dashes.length * 0.08}s` }}>
                <polyline points="0,-5 10,0 0,5" fill="none" stroke="black" strokeWidth="3" />
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
    { x: 5, y: 15, size: 4, delay: 0 }, { x: 15, y: 8, size: 3, delay: 0.1 },
    { x: 25, y: 20, size: 5, delay: 0.2 }, { x: 85, y: 10, size: 4, delay: 0.3 },
    { x: 95, y: 18, size: 3, delay: 0.4 }, { x: 10, y: 85, size: 4, delay: 0.5 },
    { x: 20, y: 75, size: 5, delay: 0.6 }, { x: 90, y: 80, size: 4, delay: 0.7 },
    { x: 95, y: 90, size: 3, delay: 0.8 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {dots.map((dot, index) => (
        <motion.div key={index} className="absolute rounded-full bg-gray-400"
          style={{ left: `${dot.x}%`, top: `${dot.y}%`, width: `${dot.size}px`, height: `${dot.size}px` }}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: dot.delay, duration: 0.5 }} />
      ))}
    </div>
  );
};

const products = [
  {
    name: "Munchies",
    href: "/munchies",
    description: "Snack smart with munchies that are big on taste and free from junk.",
    icon: "/assets/icon1.png",
    photo: "/assets/9 1.png",
  },
  {
    name: "Cookies",
    href: "/cookies",
    description: "Deliciously light, naturally sweet—healthy cookies for every mindful munch.",
    icon: "/assets/icon2.png",
    photo: "/assets/7 1.png",
  },
  {
    name: "Namkeen",
    href: "/namkeen",
    description: "Wholesome crunch in every bite—our healthy namkeen made in 100% groundnut oil.",
    icon: "/assets/icon3.png",
    photo: "/assets/8 1.png",
  },
];

/* Shared container — every section uses this to stay the same width */
const CONTAINER = "mx-auto max-w-6xl px-4 md:px-8 lg:px-12";

export default function AboutUsPage() {
  const animatedRef = useRef(null);
  const inView = useInView(animatedRef, { once: true });
  const words = "Why to choose us?".split(" ");

  const handleClick = () => { window.location.href = "/"; };

  return (
    <main className="w-full">

      {/* ── 1. About Us heading ── */}
      <div className={CONTAINER}>
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-left mt-4 mb-4 md:mb-6 lg:mb-8">
          About Us
        </h1>
      </div>

      {/* ── 2. Hero: bowl left + text right ── */}
      <div className={CONTAINER}>
        <div className="flex flex-row items-center gap-4 md:gap-8 lg:gap-12 mb-8 md:mb-12 lg:mb-16">
          {/* Images: bowl + mixture overlay */}
          <div className="relative flex-shrink-0 w-[130px] md:w-[240px] lg:w-[340px]">
            <Image
              src="/assets/makhana-bowl.png"
              alt="Puffed makhana snacks in a bowl"
              width={340}
              height={340}
              className="w-full object-contain"
              priority
            />
         
          </div>
          {/* Intro text */}
          <p className="text-[12px] md:text-xl lg:text-[26px] leading-relaxed text-black flex-1">
            When we found that our kid is only eating Snacks that were made with
            harmful ingredients. We started making Snacks in our Home by infusing{" "}
            <strong>high-quality ingredients.</strong>
          </p>
        </div>
      </div>

      {/* ── 4. 2021 launch: text left + mixture right ── */}
      <div className={CONTAINER}>
        <div className="flex flex-row items-center gap-4 md:gap-8 lg:gap-12 mt-4 md:mt-0 mb-8 md:mb-12">
          <p className="text-[12px] md:text-xl lg:text-[26px] leading-relaxed text-black flex-1">
            Soon in{" "}
            <strong>2021 launched &ldquo;Let&apos;s Try&rdquo;</strong> with the
            purpose to provide better products with high-quality ingredients.
          </p>
          <div className="flex-shrink-0 w-[120px] md:w-[220px] lg:w-[300px]">
            <Image
              src="/assets/makhana-mixture.png"
              alt="Makhana Mixture — Let's Try product"
              width={300}
              height={300}
              loading="lazy"
              className="w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* ── 5. Company description ── */}
      <div className={CONTAINER}>
        <div className="border-2 border-[#F4A939] bg-[#FFF8F0] rounded-[15px] px-5 md:px-8 py-5 mb-10">
          <p className="text-[12px] md:text-xl lg:text-[22px] leading-relaxed text-black">
            At Let&apos;s Try, we believe healthy snacking can be fun too. We follow
            traditional methods to make all our snacks, just like your grandma used
            to. We use 100% groundnut oil. No preservatives, No artificial flavors,
            or colors, no trans fats or cholesterol. We have a large variety of
            snacks, all of which have a unique taste and flavor. Our products are
            tastier and healthier than other junk food and can be consumed by anyone.
          </p>
        </div>
      </div>

      {/* ── 6. Why choose us — full-width amber background ── */}
      <section className="bg-[#FFDFAB6B] w-full py-8 md:py-10 lg:py-12">
        <div className={CONTAINER}>
          <div ref={animatedRef} className="flex justify-center mb-6">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-center flex flex-wrap justify-center items-center gap-x-2 md:gap-x-3">
              <Image src="/assets/nature 1.png" alt="" width={90} height={36}
                className="w-[36px] md:w-[55px] lg:w-[75px] object-contain flex-shrink-0"
                aria-hidden="true" />
              {words.map((word, index) => (
                <motion.span key={index}
                  initial={{ y: -20, opacity: 0, filter: "blur(6px)" }}
                  animate={inView ? { y: 0, opacity: 1, filter: "blur(0)" } : {}}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className="inline-block">
                  {word}
                </motion.span>
              ))}
              <Image src="/assets/nature 2.png" alt="" width={90} height={36}
                className="w-[36px] md:w-[55px] lg:w-[75px] object-contain flex-shrink-0 scale-x-[-1]"
                aria-hidden="true" />
            </h2>
          </div>
          {/* Mobile: badges inside a white card */}
          <div className="flex justify-center md:hidden">
            <div className="bg-white border border-gray-200 rounded-[12px] p-3 w-full max-w-[310px]">
              <Image
                src="/assets/Group_779_phone_view.png"
                alt="Trans Fat Free, Palm Oil Free, No Cholesterol, Tea Time Snacks, High Fiber, No White Sugar"
                width={310}
                height={120}
                className="w-full object-contain"
              />
            </div>
          </div>
          {/* Tablet / Desktop: badges directly on amber background */}
          <div className="hidden md:flex justify-center">
            <Image
              src="/assets/Group 776.png"
              alt="Trans Fat Free, Palm Oil Free, No Cholesterol, Tea Time Snacks, High Fiber, No White Sugar"
              width={900}
              height={160}
              className="w-full max-w-[580px] lg:max-w-[860px] object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── 7. Here at Let's Try — nuts bowl left, text right ── */}
      <div className={CONTAINER}>
        <div className="flex gap-4 md:gap-8 lg:gap-10 items-center border-2 border-[#F4A939] bg-[#FFF8F0] rounded-[15px] p-4 md:p-6 lg:p-8 my-8 md:my-10">
          {/* Image — fixed on mobile, 40% of card on desktop */}
          <div className="flex-shrink-0 w-[120px] md:w-[300px] lg:w-[40%]">
            <Image
              src="/assets/mixed-nuts-dry-fruits.png"
              alt="Bowl of mixed nuts and dry fruits"
              width={520}
              height={520}
              loading="lazy"
              className="w-full object-contain"
            />
          </div>
          {/* Text */}
          <div className="flex flex-col gap-1 md:gap-2 lg:gap-3 flex-1">
            <p className="text-[13px] md:text-xl lg:text-2xl xl:text-3xl font-semibold text-black leading-snug">
              Here at Let&apos;s Try we believe that good
            </p>
            <p className="text-[13px] md:text-xl lg:text-2xl xl:text-3xl font-semibold text-[#0E5201] leading-snug">
              snacks should be accessible to everyone.
            </p>
            <p className="text-[11px] md:text-base lg:text-lg xl:text-xl leading-relaxed text-black mt-1 md:mt-2">
              Our prices fit almost any budget, so you can enjoy the convenience of
              home-delivered snacks, while still saving money.
            </p>
          </div>
        </div>
      </div>

      {/* ── 8. Healthy snacking heading (Figma image) ── */}
      <div className={`${CONTAINER} flex justify-center mb-6 md:mb-8`}>
        <Image
          src="/assets/Group 633.png"
          alt="Healthy snacking — we're offering to our customers."
          width={640}
          height={120}
          className="w-full max-w-[260px] md:max-w-[460px] lg:max-w-[620px] object-contain"
        />
      </div>

      {/* ── 9. Product cards ── */}
      <div className={CONTAINER}>

        {/* Mobile: 3-column grid */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {products.map((p) => (
            <article key={p.name}
              className="flex flex-col border border-[#AFADAD] rounded-[10px] overflow-hidden">
              <div className="p-2">
                <Image src={p.icon} alt={`${p.name} icon`} width={24} height={24}
                  className="w-6 h-6 object-contain mb-1" />
                <h3 className="text-[11px] text-black font-semibold leading-tight mb-1">
                  {p.name}
                </h3>
                <p className="text-[8px] text-black leading-tight mb-1 line-clamp-3">
                  {p.description}
                </p>
                <Link href={p.href}
                  className="text-[9px] text-[#0C5273] font-medium flex items-center gap-0.5">
                  Explore <GoArrowRight size={9} />
                </Link>
              </div>
              <div className="h-[80px] bg-[#F8F8F8] overflow-hidden">
                <Image src={p.photo} alt={p.name} width={120} height={80} loading="lazy"
                  className="w-full h-full object-contain" />
              </div>
            </article>

          ))}
        </div>

        {/* Tablet: 3-column, medium */}
        <div className="hidden md:grid lg:hidden grid-cols-3 gap-4">
          {products.map((p) => (
            <article key={p.name}
              className="relative flex flex-col border border-[#AFADAD] rounded-[15px] h-[260px] p-4 overflow-hidden">
              <Image src={p.icon} alt={`${p.name} icon`} width={36} height={36}
                className="w-8 h-8 object-contain mb-2" />
              <h3 className="text-xl mb-2 text-black font-semibold">{p.name}</h3>
              <p className="text-[14px] text-black font-medium mb-3 max-w-[55%] leading-snug">
                {p.description}
              </p>
              <Link href={p.href}
                className="text-base text-[#0C5273] font-medium flex items-center gap-2 hover:underline cursor-pointer">
                Explore <GoArrowRight />
              </Link>
              <div className="absolute bottom-0 right-0 w-[48%] h-[58%] rounded-tl-[20px] overflow-hidden bg-[#F3F3F3]">
                <Image src={p.photo} alt={p.name} width={160} height={160}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
              </div>
            </article>
          ))}
        </div>

        {/* Desktop: 3-column, large */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
          {products.map((p) => (
            <article key={p.name}
              className="relative flex flex-col border border-[#AFADAD] rounded-[15px] h-[320px] p-6 overflow-hidden">
              <Image src={p.icon} alt={`${p.name} icon`} width={40} height={40}
                className="w-9 h-9 object-contain mb-3" />
              <h3 className="text-3xl mb-3 text-black font-semibold">{p.name}</h3>
              <p className="text-[16px] text-black font-semibold mb-3 max-w-[55%] leading-snug">

                {p.description}
              </p>
              <Link href={p.href}
                className="text-xl text-[#0C5273] font-medium flex items-center gap-2 hover:underline cursor-pointer">
                Explore <GoArrowRight />
              </Link>
              <div className="absolute bottom-0 right-0 w-[48%] h-[62%] rounded-tl-[20px] overflow-hidden">
                <Image src={p.photo} alt={p.name} width={200} height={200}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ── 10. CTA button ── */}
      <div className={`${CONTAINER} flex justify-center my-8`}>
        <button
          className="w-full max-w-xl py-2.5 rounded-[10px] text-white text-[16px] md:text-2xl font-medium bg-[#0C5273] hover:bg-[#09415b] transition-colors"
          onClick={handleClick}
        >
          Explore more snacking options
        </button>
      </div>

    </main>
  );
}
