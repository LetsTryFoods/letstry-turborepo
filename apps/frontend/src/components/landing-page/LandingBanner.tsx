"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type LandingBannerProps = {
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
};

export const LandingBanner = ({
  headline,
  subtext,
  ctaText,
  ctaLink,
  backgroundImage,
}: LandingBannerProps) => {
  return (
    <section
      id="banner"
      className="relative w-full min-h-[420px] md:min-h-[520px] lg:min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : "linear-gradient(135deg, #0C5273 0%, #1a7fa8 40%, #23a6d5 70%, #0C5273 100%)",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
        >
          {headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
        >
          {subtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 md:mt-10"
        >
          <Link
            href={ctaLink}
            className="inline-block px-8 mb-4 py-3.5 md:px-10 md:py-4 bg-white text-[#0C5273] font-bold text-base md:text-lg rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5"
          >
            {ctaText}
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};
