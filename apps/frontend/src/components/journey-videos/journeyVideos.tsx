"use client";

import React, { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const videos = [
  { videoUrl: "https://www.youtube.com/watch?v=k1nRcy9rZIc" },
  { videoUrl: "https://www.youtube.com/watch?v=S-L4y9eyjso" },
  { videoUrl: "https://www.youtube.com/watch?v=k1nRcy9rZIc" },
  { videoUrl: "https://www.youtube.com/watch?v=S-L4y9eyjso" },
];

const getYouTubeId = (url: any) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v") || "";
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    return "";
  } catch {
    return "";
  }
};
const getYouTubeThumb = (url: any) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/0.jpg` : "";
};

const AUTOPLAY_DELAY = 4000;

const JourneyVideos = () => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(
    () =>
      videos.map((v) => ({
        ...v,
        thumbnail: getYouTubeThumb(v.videoUrl),
      })),
    []
  );

  const handleClick = (index: number, videoUrl: string) => {
    if (!swiperRef.current) return;
    if (swiperRef.current.realIndex === index) {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    } else {
      swiperRef.current.slideToLoop(index);
    }
  };

  return (
    <section className="w-full flex flex-col items-center px-4 sm:px-6">
      <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-black text-center lg:mb-8">
        From dreams to deals:<br />our journey!
      </h2>

      <div className="relative w-full max-w-6xl">
        <Swiper
          modules={[Autoplay]}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          centeredSlides={true}
          loop={true}
          initialSlide={1}
          spaceBetween={0}
          autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 1.6 },
            768: { slidesPerView: 3 },
          }}
          className="w-full"
        >
          {slides.map((video, i) => (
            <SwiperSlide key={i} className="!h-full">
              {({ isActive }) => (
                <div
                  onClick={() => handleClick(i, video.videoUrl)}
                  className={`relative cursor-pointer transition-transform duration-300 ${isActive ? "scale-100" : "scale-75"
                    }`}
                >
                  <img
                    src={video.thumbnail}
                    alt={`Video ${i + 1}`}
                    className="w-full max-w-full h-[160px] lg:h-[250px] object-cover rounded-xl border border-gray-300 bg-gray-100"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding="async"
                  />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg
                      className="w-12 h-12 lg:w-20 lg:h-20"
                      style={{ color: "black" }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, j) => (
            <div
              key={j}
              className="w-20 h-1 bg-white/30 overflow-hidden rounded-sm"
              style={{ backdropFilter: "blur(2px)" }}
            >
              <div
                className={`h-full bg-white ${j === activeIndex
                  ? "w-full transition-[width] duration-[4000ms] ease-linear"
                  : "w-0"
                  }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneyVideos;
