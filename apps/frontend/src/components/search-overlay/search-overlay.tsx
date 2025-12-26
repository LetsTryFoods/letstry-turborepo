"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/stores/search-store';
import Image from 'next/image';

const POPULAR_SEARCHES = ['Bhujia', 'Murukku'];

const SUGGESTED_PRODUCTS = [
    {
        id: '1',
        title: 'Makhana Mixture',
        price: 160,
        image: 'https://d11a0m43ek7ap8.cloudfront.net/baf14c8fb442c0eadd20e2939de06905.webp',
        weight: '200 gm',
    },
    {
        id: '2',
        title: 'Sabudana Mixture',
        price: 160,
        mrp: 160,
        discount: '20% OFF',
        image: 'https://d11a0m43ek7ap8.cloudfront.net/baf14c8fb442c0eadd20e2939de06905.webp',
        weight: '200 gm',
    },
];

export const SearchOverlay = () => {
    const { isOpen, closeSearch } = useSearchStore();
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                    className="fixed inset-0 z-[110] bg-white flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                        <button onClick={closeSearch} className="p-1">
                            <ChevronLeft size={32} className="text-black" />
                        </button>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                            <Input
                                autoFocus
                                placeholder="Search products"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full pl-10 h-12 rounded-xl border-gray-300 focus-visible:ring-0 focus-visible:border-gray-400"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-black mb-4">Popular Searches</h3>
                            <div className="flex flex-wrap gap-3">
                                {POPULAR_SEARCHES.map((item) => (
                                    <button
                                        key={item}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                                        onClick={() => setSearchValue(item)}
                                    >
                                        <Search size={18} className="text-gray-400" />
                                        <span className="text-lg font-medium text-black">{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {SUGGESTED_PRODUCTS.map((product) => (
                                <div key={product.id} className="border border-gray-100 rounded-2xl p-3 flex flex-col bg-white shadow-sm">
                                    <div className="relative w-full h-40 bg-[#F5F5F5] rounded-xl mb-3 overflow-hidden">
                                        <Image
                                            src={product.image}
                                            alt={product.title}
                                            fill
                                            className="object-contain p-4"
                                        />
                                    </div>

                                    <h4 className="text-base font-bold text-black line-clamp-1 mb-1 text-center">
                                        {product.title}
                                    </h4>

                                    <div className="flex flex-col items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-black">₹{product.price}.00</span>
                                            {product.mrp && (
                                                <span className="text-sm text-gray-400 line-through">MRP ₹{product.mrp}.00</span>
                                            )}
                                        </div>
                                        {product.discount && (
                                            <span className="text-sm font-bold text-blue-600">{product.discount}</span>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <div className="mb-2">
                                            <p className="text-xs font-bold text-black mb-1">Weight</p>
                                            <div className="relative">
                                                <select className="w-full h-8 pl-2 pr-8 text-xs font-medium border border-gray-200 rounded bg-white appearance-none">
                                                    <option>{product.weight}</option>
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                                        <path d="M1 1L5 5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="w-full h-9 bg-white border border-[#003B65] text-[#003B65] hover:bg-[#003B65] hover:text-white font-bold text-sm rounded-md transition-all">
                                            Add to cart
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
