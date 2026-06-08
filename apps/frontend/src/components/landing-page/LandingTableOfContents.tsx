"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type TocItem = {
  id: string;
  label: string;
};

type LandingTableOfContentsProps = {
  items: TocItem[];
};

export const LandingTableOfContents = ({
  items,
}: LandingTableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 px-4 sm:px-6"
    >
      <div className="container mx-auto">
        <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
          {items.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                  activeId === id
                    ? "bg-[#0C5273] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
};
