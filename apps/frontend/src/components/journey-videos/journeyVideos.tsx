"use client";

import  { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const videos = [
  { videoUrl: "https://www.youtube.com/watch?v=k1nRcy9rZIc" },
  { videoUrl: "https://www.youtube.com/watch?v=S-L4y9eyjso" },
  { videoUrl: "https://www.youtube.com/watch?v=k1nRcy9rZIc" },
  { videoUrl: "https://www.youtube.com/watch?v=S-L4y9eyjso" },
];

const getYouTubeId = (url:any) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v") || "";
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
    return "";
  } catch {
    return "";
  }
};

const getYouTubeThumb = (url:any) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/0.jpg` : "";
};

const AUTOPLAY_DELAY = 4000;

const JourneyVideos = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false })]
  );

  const slides = videos.map((v) => ({
    ...v,
    thumbnail: getYouTubeThumb(v.videoUrl),
  }));

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleClick = (index: number, videoUrl: string) => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() === index) {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    } else {
      emblaApi.scrollTo(index);
    }
  };

  return (
    <section className="w-full py-12 lg:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 lg:mb-12">
          From dreams to deals:
          <br />
          our journey!
        </h2>

        <div className="relative w-full">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 lg:gap-6 pb-12">
              {slides.map((video, i) => {
                const isActive = i === activeIndex;
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[85%] sm:w-[60%] lg:w-[calc(33.333%-16px)]"
                  >
                    <div
                      onClick={() => handleClick(i, video.videoUrl)}
                      className={`relative cursor-pointer transition-all duration-500 ease-out ${
                        isActive
                          ? "scale-100 opacity-100"
                          : "scale-90 opacity-70 lg:scale-85"
                      }`}
                    >
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <img
                          src={video.thumbnail}
                          alt={`Journey Video ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading={i === 0 ? "eager" : "lazy"}
                          fetchPriority={i === 0 ? "high" : "auto"}
                          decoding="async"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                            <svg
                              className="w-8 h-8 lg:w-10 lg:h-10 text-gray-900 ml-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <polygon points="8,5 19,12 8,19" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, j) => (
              <div
                key={j}
                className="w-16 lg:w-20 h-1 bg-gray-200 overflow-hidden rounded-full"
              >
                <div
                  className={`h-full bg-gray-900 ${
                    j === activeIndex
                      ? "w-full transition-[width] duration-[4000ms] ease-linear"
                      : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyVideos;
