'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/image-utils';

interface Blog {
    _id: string;
    slug: string;
    title: string;
    excerpt: string;
    image?: string | null;
    date?: string | null;
}

interface BlogGridProps {
    blogs: Blog[];
}

export default function BlogGrid({ blogs }: BlogGridProps) {
    const [showAll, setShowAll] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const initialCount = isMobile ? 4 : 8;
    const displayedBlogs = showAll ? blogs : blogs.slice(0, initialCount);
    const hasMore = blogs.length > initialCount;

    console.log(displayedBlogs, "jai maa kali");

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {displayedBlogs.map((blog) => (
                    <article
                        key={blog._id}
                        className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                        <div className="relative h-48 bg-gray-100">
                            {blog.image ? (
                                <Image
                                    src={getCdnUrl(blog.image)}
                                    alt={blog.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded mb-4">
                                {blog.date || 'No date'}
                            </div>

                            <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                                {blog.title}
                            </h2>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {blog.excerpt}
                            </p>

                            <Link
                                href={`/blog/${blog.slug}`}
                                className="inline-flex items-center text-teal-700 hover:text-teal-800 font-medium text-sm"
                            >
                                Read More
                                <svg
                                    className="w-4 h-4 ml-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </article>
                ))}
            </div>

            {hasMore && !showAll && (
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowAll(true)}
                        className="cursor-pointer border-2 border-teal-700 text-teal-700 hover:bg-teal-50 font-medium px-8 py-3 rounded-lg transition-colors inline-flex items-center"
                    >
                        View more articles
                        <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
}
