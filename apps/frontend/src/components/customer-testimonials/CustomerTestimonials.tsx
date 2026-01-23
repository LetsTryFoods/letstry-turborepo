"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  name: string;
  title: string;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Vipin Sharma",
    title: "Amazing taste",
    text: "Perfect snack for summer, light and tasty. A better and healthy snacking item with good spicy taste !!!",
  },
  {
    name: "Pooja Verma",
    title: "Truly Addictive!",
    text: "Crispy and full of flavor! My family can’t get enough of these snacks. Loved the packaging too.",
  },
  {
    name: "Amit Raj",
    title: "Light and Crunchy",
    text: "This has become my go-to for tea time. Tastes fresh and has just the right amount of seasoning.",
  },
  {
    name: "Neha Gupta",
    title: "Deliciously Healthy",
    text: "Snacking guilt-free is finally possible. My kids love it and I love how natural it feels.",
  },
  {
    name: "Rahul Mehta",
    title: "Perfect Travel Buddy",
    text: "I always carry a pack during trips. Doesn’t get soggy and satisfies my munch cravings.",
  },
  {
    name: "Simran Kaur",
    title: "Five Stars!",
    text: "Highly recommend! Balanced flavors and super light on the stomach. Will definitely reorder.",
  },
];

const CustomerTestimonials = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <section className="w-full py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">
            Let our customer&apos;s speak for us
          </h2>

          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 lg:gap-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[380px]"
                  >
                    <div className="h-full border-2 border-gray-300 rounded-lg p-5 lg:p-6 bg-white shadow-md flex flex-col justify-between min-h-[200px] lg:min-h-[240px] transition-shadow hover:shadow-lg">
                      <div>
                        <h3 className="font-bold text-base lg:text-xl text-[#0C5273] mb-2 lg:mb-3">
                          {testimonial.title}
                        </h3>
                        <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                          {testimonial.text}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm lg:text-base shadow-md">
                          {getInitials(testimonial.name)}
                        </div>
                        <div className="text-right">
                          <p className="text-sm lg:text-base font-medium text-gray-900">
                            {testimonial.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="border-2 border-gray-500 rounded-full flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 transition-all duration-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="border-2 border-gray-500 rounded-full flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 transition-all duration-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                aria-label="Next testimonials"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CustomerTestimonials;
