"use client";

import Image from "next/image";
import Link from "next/link";
import { getCdnUrl } from "@/lib/image-utils";
import { ArrowUpRight } from "lucide-react";

interface WholesomeCardProps {
  title: string;
  name: string;
  img: string;
  hasRange: boolean;
  gradient: string;
  slug: string;
}

export function WholesomeCard({
  title,
  name,
  img,
  hasRange,
  gradient,
  slug,
}: WholesomeCardProps) {
  const content = (
    <div
      className={`group rounded-2xl overflow-hidden flex flex-col h-[220px] md:h-[280px] lg:h-[400px] w-full transition-transform duration-300 ${hasRange ? "hover:scale-105 cursor-pointer" : "opacity-70"
        }`}
      style={{
        background: gradient,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {!hasRange && (
        <div className="absolute top-2 left-2 z-10 lg:text-sm md:text-xs text-[8px] flex items-center justify-center font-medium rounded bg-[#0C5273] text-white p-1 max-w-[110px]">
          Out of Stock
        </div>
      )}

      <div className="flex-1 flex items-center justify-center pt-6 sm:pt-8 md:pt-10 pb-2">
        <div className="relative w-full overflow-hidden flex items-center justify-center h-[90px] sm:h-[110px] md:h-[180px] lg:h-[260px] transition-transform duration-300 group-hover:scale-110">
          <Image
            src={getCdnUrl(img)}
            alt={name}
            width={280}
            height={260}
            className={`transition-transform duration-300 ${["Muffins & Cakes", "No Maida Range"].includes(title)
                ? "object-contain w-auto max-w-[120px] sm:max-w-[120px] md:max-w-[200px] lg:max-w-[280px]"
                : "w-full h-full object-contain"
              }`}
            priority={false}
            loading="lazy"
          />
        </div>
      </div>

      <div className="flex justify-between items-center min-h-[50px] px-3 lg:py-4 bg-white">
        <span className="lg:text-lg text-sm font-bold text-black">{name}</span>
        {hasRange && (
          <div className="bg-black p-1 rounded-full flex items-center justify-center lg:h-9 lg:w-9 w-6 h-6">
            <ArrowUpRight className="lg:h-6 lg:w-6 h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );

  if (!hasRange) {
    return <div className="relative">{content}</div>;
  }

  return (
    <Link
      href={`/${encodeURIComponent(slug)}`}
      className="block focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-2xl"
    >
      {content}
    </Link>
  );
}
