import Image from "next/image";

interface TopBannerProps {
  imageUrl?: string;
  imageAlt?: string;
  items?: string[];
}

export const TopBanner = ({ imageUrl, imageAlt = "Banner", items = [
  "No Palm Oil",
  "No Cholesterol",
  "No Trans Fat",
  "No White Sugar",
  "High Fiber"
] }: TopBannerProps) => {
  if (imageUrl) {
    return (
      <div className="w-full bg-[#001f3f] py-2 relative z-30">
        <div className="relative w-full h-8">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#001f3f] py-2 overflow-hidden relative z-30">
      <div className="flex items-center gap-4 md:gap-8 lg:gap-12 animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-4 md:gap-8 lg:gap-12">
            <span className="text-yellow-400 font-bold text-sm md:text-base lg:text-lg">
              {item}
            </span>
            <span className="text-yellow-400 text-xl md:text-2xl">|</span>
          </div>
        ))}
      </div>
    </div>
  );
};
