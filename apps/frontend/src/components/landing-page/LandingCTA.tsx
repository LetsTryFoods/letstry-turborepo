"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";

type LandingCTAProps = {
  headline: string;
  description: string;
  shopNowLink: string;
  buyNowLink: string;
  shopNowText?: string;
  buyNowText?: string;
};

export const LandingCTA = ({
  headline,
  description,
  shopNowLink,
  buyNowLink,
  shopNowText = "Shop Now",
  buyNowText = "Buy Now",
}: LandingCTAProps) => {
  return (
    <section
      id="cta"
      className="relative py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0C5273] via-[#1a7fa8] to-[#0C5273]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight"
        >
          {headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={shopNowLink}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 md:px-10 md:py-4 bg-white text-[#0C5273] font-bold text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-5 h-5" />
            {shopNowText}
          </Link>

          <Link
            href={buyNowLink}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 md:px-10 md:py-4 border-2 border-white text-white font-bold text-base md:text-lg rounded-full hover:bg-white hover:text-[#0C5273] transition-all duration-300 hover:-translate-y-0.5"
          >
            <ExternalLink className="w-5 h-5" />
            {buyNowText}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
