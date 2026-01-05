import { getBestsellerProducts } from "@/lib/product";
import { BestsellerCard } from "./bestseller-card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";


export const BestsellerCarousel = async () => {
  const products = await getBestsellerProducts("best-selling", 20);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-amber-800">
      <div className="container mx-auto px-4">
        <header className="py-8">
          <h2
            className="text-4xl md:text-9xl text-center text-amber-100"
            style={{ fontFamily: "var(--font-agbalumo)" }}
          >
            Bestseller
          </h2>
        </header>
        <div className="pb-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product: any) => (
                <CarouselItem
                  key={product._id}
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <BestsellerCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-6">
              <CarouselPrevious className="static translate-y-0 bg-gray-700 hover:bg-gray-600 text-white border-none" />
              <CarouselNext className="static translate-y-0 bg-gray-700 hover:bg-gray-600 text-white border-none" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};
