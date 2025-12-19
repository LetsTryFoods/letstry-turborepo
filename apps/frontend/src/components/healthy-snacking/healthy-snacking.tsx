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
      className="w-full py-8"
      style={{
        background: "linear-gradient(180deg, #FFFFFF, #FAEFEB, #FFF0EA, #FFFFFF)",
      }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl lg:text-5xl font-bold text-gray-900 text-center mb-8 lg:mb-12">
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
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 lg:gap-16">
                  <Link
                    href={slide.redirectTo}
                    className="relative group w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[500px] md:h-[450px] flex-shrink-0"
                  >
                    <Image
                      src={slide.img}
                      alt={slide.tag}
                      fill
                      className="object-cover rounded-xl shadow-md"
                    />
                    <span className="absolute bottom-3 right-3 bg-white/40 p-2 rounded-full shadow group-hover:bg-white/60 transition-colors">
                      <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </span>
                  </Link>

                  <div className="w-full md:w-[400px] lg:w-[800px] flex flex-col justify-center text-center md:text-left py-4">
                    <h3 className="text-lg md:text-2xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-orange-300 to-orange-500 bg-[length:200%_100%] bg-clip-text text-transparent animate-shine">
                      {slide.title}
                    </h3>
                    <p className="text-blackline  text-sm md:text-2xl leading-relaxed whitespace-pre-line line-clamp-6 md:line-clamp-8">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="relative w-full max-w-5xl">
              <div className="absolute top-[5px] md:top-[11px] left-[8%] right-[9%] h-0.5 bg-[#FFD3B3] z-0">
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
              <div className="flex justify-between relative z-10 px-[5%]">
                {healthySnackingSlides.map((slide, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`w-3 h-3 md:w-6 md:h-6 rounded-full cursor-pointer ${
                        index <= currentIndex ? "bg-[#FF5400]" : "bg-gray-300"
                      }`} 
                    />
                    <span 
                      className={`text-[10px] md:text-sm text-center mt-2 font-normal transition-all duration-200 whitespace-nowrap ${
                        index === currentIndex ? "text-orange-600 font-bold" : "text-gray-700"
                      }`}
                    >
                      {slide.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CarouselPrevious className="static translate-y-0 w-8 h-8 md:w-10 md:h-10 border-2 border-gray-500 bg-transparent hover:bg-gray-100">
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </CarouselPrevious>
              <CarouselNext className="static translate-y-0 w-8 h-8 md:w-10 md:h-10 border-2 border-gray-500 bg-transparent hover:bg-gray-100">
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
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
