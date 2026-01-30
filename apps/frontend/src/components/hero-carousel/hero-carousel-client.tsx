"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/navigation";

const DESKTOP_BANNER_WIDTH = 1800;
const DESKTOP_BANNER_HEIGHT = 500;
const MOBILE_BANNER_WIDTH = 400;
const MOBILE_BANNER_HEIGHT = 200;

interface Banner {
  _id: string;
  name: string;
  headline: string;
  imageUrl: string;
  mobileImageUrl: string;
  position: number;
  url: string;
  ctaText: string;
}

interface HeroCarouselClientProps {
  banners: Banner[];
}

export const HeroCarouselClient = ({ banners }: HeroCarouselClientProps) => {
  const router = useRouter();
  const [mobileApi, setMobileApi] = useState<CarouselApi>();
  const [desktopApi, setDesktopApi] = useState<CarouselApi>();
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(0);

  useEffect(() => {
    if (!mobileApi) return;

    mobileApi.on("select", () => {
      setMobileActiveIndex(mobileApi.selectedScrollSnap());
    });
  }, [mobileApi]);

  useEffect(() => {
    if (!desktopApi) return;

    desktopApi.on("select", () => {
      setDesktopActiveIndex(desktopApi.selectedScrollSnap());
    });
  }, [desktopApi]);

  const handleBannerClick = (url: string) => {
    if (url) {
      router.push(url);
    }
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <>
      <section className="my-2 px-2 sm:px-2 md:px-3 lg:hidden block">
        <div
          className="relative w-full overflow-hidden rounded-[10px]"
          style={{ aspectRatio: `${MOBILE_BANNER_WIDTH} / ${MOBILE_BANNER_HEIGHT}` }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            className="w-full h-full"
            setApi={setMobileApi}
          >
            <CarouselContent className="h-full">
              {banners.map((banner, i) => (
                <CarouselItem key={banner._id} className="h-full pl-0">
                  <div
                    className="relative w-full h-full cursor-pointer"
                    onClick={() => handleBannerClick(banner.url)}
                    style={{ minHeight: `${MOBILE_BANNER_HEIGHT}px` }}
                  >
                    <img
                      src={banner.mobileImageUrl}
                      alt={banner.headline || 'Promotional banner'}
                      width={MOBILE_BANNER_WIDTH}
                      height={MOBILE_BANNER_HEIGHT}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover rounded-[10px] bg-gray-100"
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                      {banners.map((_, j) => (
                        <div key={j} className="w-6 h-1 bg-white/30 overflow-hidden rounded-sm">
                          <div
                            className={`h-full bg-white ${
                              j === mobileActiveIndex
                                ? 'w-full transition-[width] duration-[2000ms] ease-linear'
                                : 'w-0'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      <section className="lg:my-4 md:mt-2 px-4 sm:px-3 md:px-6 lg:px-10 hidden lg:block">
        <div
          className="relative w-full overflow-hidden rounded-[16px]"
          style={{ aspectRatio: `${DESKTOP_BANNER_WIDTH} / ${DESKTOP_BANNER_HEIGHT}` }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
              }),
            ]}
            className="w-full h-full"
            setApi={setDesktopApi}
          >
            <CarouselContent className="h-full">
              {banners.map((banner, i) => (
                <CarouselItem key={banner._id} className="h-full pl-0">
                  <div
                    className="relative w-full h-full cursor-pointer"
                    onClick={() => handleBannerClick(banner.url)}
                    style={{ minHeight: `${DESKTOP_BANNER_HEIGHT}px` }}
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.headline || 'Promotional banner'}
                      width={DESKTOP_BANNER_WIDTH}
                      height={DESKTOP_BANNER_HEIGHT}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover rounded-[16px] bg-gray-100"
                    />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {banners.map((_, j) => (
                        <div key={j} className="lg:w-20 md:w-16 w-5 h-1 bg-white/30 overflow-hidden rounded-sm">
                          <div
                            className={`h-full bg-white ${
                              j === desktopActiveIndex
                                ? 'w-full transition-[width] duration-[2000ms] ease-linear'
                                : 'w-0'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </section>
    </>
  );
};
