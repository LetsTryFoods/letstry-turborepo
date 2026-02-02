"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useRouter } from "next/navigation";
import type { Swiper as SwiperType } from 'swiper';

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
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [desktopActiveIndex, setDesktopActiveIndex] = useState(0);

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
          <Swiper
            modules={[Autoplay]}
            style={{ width: '100%', height: '100%' }}
            className="rounded-[10px]"
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop
            onSlideChange={(swiper) => setMobileActiveIndex(swiper.realIndex)}
          >
            {banners.map((banner, i) => (
              <SwiperSlide key={banner._id} className="!h-full">
                <div
                  className="relative w-full h-full cursor-pointer"
                  onClick={() => handleBannerClick(banner.url)}
                >
                  <img
                    src={banner.mobileImageUrl}
                    alt={banner.headline || 'Promotional banner'}
                    width={MOBILE_BANNER_WIDTH}
                    height={MOBILE_BANNER_HEIGHT}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain rounded-[10px] bg-gray-100"
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {banners.map((_, j) => (
                      <div key={j} className="w-6 h-1 bg-white/30 overflow-hidden rounded-sm">
                        <div
                          className={`h-full bg-white ${j === mobileActiveIndex
                            ? 'w-full transition-[width] duration-[2000ms] ease-linear'
                            : 'w-0'
                            }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="lg:my-4 md:mt-2 px-4 sm:px-3 md:px-6 lg:px-10 hidden lg:block">
        <div
          className="relative w-full overflow-hidden rounded-[16px]"
          style={{ aspectRatio: `${DESKTOP_BANNER_WIDTH} / ${DESKTOP_BANNER_HEIGHT}` }}
        >
          <Swiper
            modules={[Autoplay, Navigation]}
            style={{ width: '100%', height: '100%' }}
            className="rounded-[16px] hero-carousel-swiper"
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            onSlideChange={(swiper) => setDesktopActiveIndex(swiper.realIndex)}
          >
            {banners.map((banner, i) => (
              <SwiperSlide key={banner._id} className="!h-full">
                <div
                  className="relative w-full h-full cursor-pointer"
                  onClick={() => handleBannerClick(banner.url)}
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
                          className={`h-full bg-white ${j === desktopActiveIndex
                            ? 'w-full transition-[width] duration-[2000ms] ease-linear'
                            : 'w-0'
                            }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </SwiperSlide>
            ))}

            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </Swiper>
        </div>
      </section>
    </>
  );
};
