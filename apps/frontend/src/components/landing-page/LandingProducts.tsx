"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";

type PlatformLink = {
    platform: string;
    link: string;
};

type LandingProduct = {
    name: string;
    slug: string;
    image: string;
    price: number;
    mrp?: number;
    tag?: string;
    websiteLink: string;
    otherPlatformLinks: PlatformLink[];
};

type LandingProductsProps = {
    heading: string;
    products: LandingProduct[];
    sectionId?: string;
};

const platformIcons: Record<string, string> = {
    Amazon: "🛒",
    Flipkart: "🛍️",
    Swiggy: "🍽️",
    Zepto: "⚡",
    Blinkit: "🟡",
};

export const LandingProducts = ({
    heading,
    products,
    sectionId = 'products',
}: LandingProductsProps) => {
    return (
        <section id={sectionId} className="py-12 md:py-16 lg:py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12"
                >
                    {heading}
                </motion.h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    {products.map((product, index) => {
                        const hasDiscount = product.mrp && product.mrp > product.price;
                        const discountPercent = hasDiscount
                            ? Math.round(
                                ((product.mrp! - product.price) / product.mrp!) * 100
                            )
                            : 0;

                        return (
                            <motion.article
                                key={product.slug}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="relative flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 text-center rounded-xl sm:rounded-2xl lg:rounded-3xl bg-white transition-all duration-300 hover:-translate-y-1"
                                style={{ boxShadow: "10px 5px 10px 4px #00000040" }}
                            >
                                {hasDiscount && (
                                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full z-10">
                                        {discountPercent}% OFF
                                    </span>
                                )}

                                {product.tag && (
                                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#0C5273] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full z-10">
                                        {product.tag}
                                    </span>
                                )}

                                <div className="relative w-full h-[120px] md:h-[150px] lg:h-[180px] mb-3">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>

                                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug min-h-[40px] md:min-h-[48px] mb-2">
                                    {product.name}
                                </h3>

                                <div className="mb-4">
                                    {hasDiscount ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                                                ₹{product.price}
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                                                ₹{product.mrp}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                                            ₹{product.price}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto space-y-2.5">
                                    <Link
                                        href={product.websiteLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#0C5273] text-white text-sm font-semibold rounded-lg hover:bg-[#003349] transition-colors duration-300"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Buy Now
                                    </Link>

                                    {product.otherPlatformLinks.length > 0 && (
                                        <div className="flex py-2 flex-wrap items-center justify-center gap-2">
                                            {product.otherPlatformLinks.map((pl) => (
                                                <Link
                                                    key={pl.platform}
                                                    href={pl.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 rounded-lg hover:border-[#0C5273] hover:text-[#0C5273] transition-colors duration-200"
                                                >
                                                    <span>{platformIcons[pl.platform] || "🔗"}</span>
                                                    {pl.platform}
                                                    <ExternalLink className="w-3 h-3 opacity-50" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
