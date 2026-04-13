"use client";

import { motion } from "framer-motion";

type ContentBlock = {
    heading: string;
    body: string;
    subBlocks?: {
        subHeading: string;
        subBody: string;
    }[];
};

type LandingContentProps = {
    title: string;
    blocks: ContentBlock[];
    sectionId?: string;
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

export const LandingContent = ({ title, blocks, sectionId = 'content' }: LandingContentProps) => {
    return (
        <section id={sectionId} className="py-12 md:py-16 lg:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <motion.h1
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 md:mb-12 leading-tight"
                >
                    {title}
                </motion.h1>

                <div className="space-y-10 md:space-y-14">
                    {blocks.map((block, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#0C5273] mb-3 md:mb-4">
                                {block.heading}
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                                {block.body}
                            </p>

                            {block.subBlocks && block.subBlocks.length > 0 && (
                                <div className="mt-6 space-y-5 pl-4 border-l-2 border-[#0C5273]/20">
                                    {block.subBlocks.map((sub, subIndex) => (
                                        <motion.div
                                            key={subIndex}
                                            variants={fadeInUp}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: subIndex * 0.1 }}
                                        >
                                            <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-1.5">
                                                {sub.subHeading}
                                            </h3>
                                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                                {sub.subBody}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
