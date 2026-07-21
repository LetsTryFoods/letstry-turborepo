import Image from "next/image";
import { Truck } from "lucide-react";

interface TopBannerProps {
  imageUrl?: string;
  imageAlt?: string;
  items?: string[];
  freeDeliveryThreshold?: number;
}

export const TopBanner = ({
  imageUrl,
  imageAlt = "Banner",
  items = [
    "No Palm Oil",
    "No Cholesterol",
    "No Trans Fat",
    "No White Sugar",
    "High Fiber",
  ],
  freeDeliveryThreshold = 499,
}: TopBannerProps) => {
  if (imageUrl) {
    return (
      <div className="w-full bg-[#001f3f] py-2 relative z-30">
        <div className="relative w-full h-8">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative z-30">
      {/* First Bar (USP Marquee) */}
      <div className="w-full bg-[#001f3f] py-2 overflow-hidden border-b border-yellow-400/10">
        <div className="flex items-center gap-4 md:gap-8 lg:gap-12 animate-marquee whitespace-nowrap">
          {[...items, ...items].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 md:gap-8 lg:gap-12"
            >
              <span className="text-yellow-400 font-bold text-sm md:text-base lg:text-lg">
                {item}
              </span>
              <span className="text-yellow-400 text-xl md:text-2xl">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* Second Bar (Free Delivery Announcement) */}
      <div
        className="w-full py-2 text-center relative z-20"
        style={{ backgroundColor: "#ffcc00" }}
      >
        <div
          className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-xs md:text-sm font-extrabold tracking-widest uppercase"
          style={{ color: "#001f3f" }}
        >
          <Truck className="h-4 w-4 shrink-0 animate-bounce" />
          <span>Free Delivery Above ₹{freeDeliveryThreshold}</span>
        </div>
      </div>
    </div>
  );
};
