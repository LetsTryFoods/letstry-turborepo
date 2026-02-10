"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { healthySnackingSlides } from "@/config/healthy-snacking.config";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const HealthySnacking = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const autoplayPlugin = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  );

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }, []);

  const setApi = useCallback((api: CarouselApi) => {
    if (!api) return;
    api.on("select", () => onSelect(api));
    onSelect(api);
  }, [onSelect]);

  return (
    <section
      className="w-full py-8 md:py-10 lg:py-12"
      style={{
        background: "linear-gradient(180deg, #FFFFFF, #FAEFEB, #FFF0EA, #FFFFFF)",
      }}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-10 lg:mb-12">
          Healthier ways to Enjoy your everyday Snacking!
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[autoplayPlugin.current]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent>
            {healthySnackingSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between gap-6 md:gap-8 lg:gap-10 xl:gap-12 px-2 sm:px-4">
                  <Link
                    href={slide.redirectTo}
                    className="relative group w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[340px] lg:w-[420px] lg:h-[400px] xl:w-[480px] xl:h-[450px] flex-shrink-0"
                  >
                    <Image
                      src={slide.img}
                      alt={slide.tag}
                      fill
                      className="object-cover rounded-xl shadow-md"
                      sizes="(max-width: 768px) 100vw, 480px"
                    />
                    <span className="absolute bottom-3 right-3 bg-white/40 p-2 rounded-full shadow group-hover:bg-white/60 transition-colors">
                      <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </span>
                  </Link>

                  <div className="w-full md:w-[340px] lg:w-[480px] xl:w-[600px] flex flex-col justify-center text-center md:text-left py-4">
                    <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 md:mb-4 lg:mb-5 bg-gradient-to-r from-orange-500 via-orange-300 to-orange-500 bg-[length:200%_100%] bg-clip-text text-transparent animate-shine">
                      {slide.title}
                    </h3>
                    <p className="text-black text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed whitespace-pre-line line-clamp-6 md:line-clamp-8">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="w-full sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto sm:mt-8 flex flex-col sm:flex-row  items-center justify-between gap-6">
            <div className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
              <div className="absolute top-[5px] md:top-[8px] lg:top-[10px] left-[8%] right-[9%] h-0.5 bg-[#FFD3B3] z-0">
                <div
                  className="h-full bg-[#FF5400] absolute top-0 left-0"
                  style={{
                    width: `${(currentIndex / (healthySnackingSlides.length - 1)) * 100}%`,
                    transition: "width 0s"
                  }}
                />
                {currentIndex < healthySnackingSlides.length - 1 && (
                  <div
                    key={`segment-${currentIndex}`}
                    className="h-full bg-[#FF5400] absolute top-0 origin-left animate-fillSegment"
                    style={{
                      left: `${(currentIndex / (healthySnackingSlides.length - 1)) * 100}%`,
                      width: `${100 / (healthySnackingSlides.length - 1)}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between relative z-10 sm:px-[5%]">
                {healthySnackingSlides.map((slide, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full cursor-pointer ${index <= currentIndex ? "bg-[#FF5400]" : "bg-gray-300"
                        }`}
                    />
                    <span
                      className={`text-[10px] md:text-xs lg:text-sm text-center mt-2 font-normal transition-all duration-200 whitespace-nowrap ${index === currentIndex ? "text-orange-600 font-bold" : "text-gray-700"
                        }`}
                    >
                      {slide.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CarouselPrevious className="static translate-y-0 w-10 h-10 lg:w-12 lg:h-12 border-2 border-gray-500 bg-transparent hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </CarouselPrevious>
              <CarouselNext className="static translate-y-0 w-10 h-10 lg:w-12 lg:h-12 border-2 border-gray-500 bg-transparent hover:bg-gray-100">
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </CarouselNext>
            </div>
          </div>
        </Carousel>
      </div>

      <style jsx>{`
        @keyframes shine {
          from {
            background-position: 0% 50%;
          }
          to {
            background-position: 200% 50%;
          }
        }
        .animate-shine {
          animation: shine 3s linear infinite;
        }
        @keyframes fillSegment {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        .animate-fillSegment {
          transform-origin: left;
          animation: fillSegment 4000ms linear forwards;
        }
      `}</style>
    </section>
  );
};
