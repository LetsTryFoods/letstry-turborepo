import { getBestsellerProducts } from "@/lib/product";
import { BestsellerCarouselClient } from "./bestseller-carousel-client";

export const BestsellerCarousel = async () => {
  const products = await getBestsellerProducts("best-selling", 20);

  if (products.length === 0) {
    return null;
  }

  return <BestsellerCarouselClient initialProducts={products} />;
};

