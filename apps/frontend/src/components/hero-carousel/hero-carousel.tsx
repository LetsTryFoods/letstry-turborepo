import { HeroCarouselClient } from "./hero-carousel-client";
import { getActiveBanners } from "@/lib/banner";

export const HeroCarousel = async () => {
  const banners = await getActiveBanners();
  
  const sortedBanners = [...banners].sort((a, b) => a.position - b.position);

  return <HeroCarouselClient banners={sortedBanners} />;
};
