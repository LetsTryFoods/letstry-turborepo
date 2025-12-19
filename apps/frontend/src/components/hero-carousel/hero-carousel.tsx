"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { carouselImages } from "@/config/carousel-config";
import Autoplay from "embla-carousel-autoplay";

export const HeroCarousel = () => {
  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {carouselImages.map((image) => (
            <CarouselItem key={image.id}>
              <div className="relative w-full  h-[300px] md:h-[400px] lg:h-[500px] aspect-[16/9] sm:aspect-[18/9] md:aspect-[21/9] overflow-hidden rounded-[10px] bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={image.id === 1}
                  loading={image.id === 1 ? "eager" : "lazy"}
                  fetchPriority={image.id === 1 ? "high" : "auto"}
                  unoptimized
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};
