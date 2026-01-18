"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { GoArrowRight } from "react-icons/go";

const NEXT_PUBLIC_API_IMAGE_URL = process.env.NEXT_PUBLIC_API_IMAGE_URL_OLD || "";
const FALLBACK_IMAGE = "/placeholder-image.svg";

const AnimatedCurvedArrow = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 500 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <motion.path
        d="M 80 120 Q 250 20, 420 120"
        stroke="#000000"
        strokeWidth="3"
        strokeDasharray="10 8"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.path
        d="M 420 120 L 405 115 M 420 120 L 405 125"
        stroke="#000000"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      />
    </svg>
  );
};

const Squares = () => {
  return (
    <div className="flex justify-center gap-4 mt-6">
      {[1, 2, 3, 4].map((item) => (
        <motion.div
          key={item}
          className="w-8 h-8 bg-[#0C5273] rounded"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: item * 0.2, duration: 0.5 }}
        />
      ))}
    </div>
  );
};

export default function AboutUsPage() {
  const animatedRef = useRef(null);
  const inView = useInView(animatedRef, { once: true });

  const words = "Our Happy Customers Love Our Products".split(" ");

  const handleClick = () => {
    window.location.href = "/snacks";
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

          <div className="lg:h-[220px] md:h-[180px] h-[120px] lg:pb-0 pb-12 flex items-center justify-center lg:mt-[70px] md:mt-[60px] pr-0 md:pr-12">
            <AnimatedCurvedArrow />
          </div>

          <div className="flex md:flex-row items-center md:gap-0 gap-6 -mt-16">
            <div className="text-[12px] md:text-2xl lg:text-[26px] leading-relaxed text-black font-normal text-left pb-4 w-[50%] md:w-[450px]">
              Soon in <strong>2021 launched &ldquo;Let&apos;s Try&rdquo;</strong> with the
              purpose to provide better products with high-quality ingredients.
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

        <section className="bg-[#FFDFAB6B] w-full md:h-[200px] lg:h-[250px] h-[250px]">
          <div ref={animatedRef} className="w-full flex justify-center mb-8">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-center md:pt-4 md:mb-[8px] pt-6 lg:pb-3 px-2 flex flex-wrap justify-center gap-x-3">
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
          <Squares />
        </section>

        <div className="flex justify-center px-4 mx-4 md:mx-8">
          <p className="max-w-4xl px-4 md:px-8 text-[12px] md:text-2xl lg:text-[26px] leading-relaxed text-black text-center my-8 lg:py-8 md:py-8">
            Here at Let&apos;s Try we believe that good snacks don&apos;t have to be
            expensive. Our prices fit almost any budget, so you can enjoy the
            convenience of home-delivered snacks, while still saving money.
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
                href="/range/Namkeen%20Range"
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
                href="/category/Cookies"
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
                href="/category/Munchies"
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
              <h3 className="text-3xl mb-4 text-black font-semibold">Namkeen</h3>
              <p className="md:text-[19px] lg:text-[18px] mb-12 text-black font-[600]">
                Wholesome crunch in every bite—our healthy namkeen made in 100%
                groundnut oil.
              </p>
              <Link
                href="/range/Namkeen%20Range"
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
              <h3 className="text-3xl mb-4 text-black font-semibold">Cookies</h3>
              <p className="md:text-[19px] lg:text-[18px] mb-12 text-black font-[600]">
                Deliciously light, naturally sweet—healthy cookies for every
                <br /> mindful munch.
              </p>
              <Link
                href="/category/Cookies"
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
              <h3 className="text-3xl mb-4 text-black font-semibold">Munchies</h3>
              <p className="md:text-[19px] lg:text-[18px] mb-12 text-black font-[600]">
                Snack smart with munchies that are big on taste and free from{" "}
                <br />
                junk.
              </p>
              <Link
                href="/category/Munchies"
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
