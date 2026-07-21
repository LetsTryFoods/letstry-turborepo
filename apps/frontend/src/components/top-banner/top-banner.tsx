import Image from "next/image";

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

  const deliveryText = `Free Delivery Above ₹${freeDeliveryThreshold}`;
  const deliveryItems = Array(10).fill(deliveryText);

  return (
    <div className="w-full relative z-30">
      {/* First Bar (USP items) */}
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

      {/* Second Bar (Free Delivery Threshold) */}
      <div className="w-full bg-[#001f3f] py-1.5 overflow-hidden border-b border-yellow-400/5">
        <div className="flex items-center gap-4 md:gap-8 lg:gap-12 animate-marquee whitespace-nowrap">
          {[...deliveryItems, ...deliveryItems].map((item, index) => (
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
    </div>
  );
};
