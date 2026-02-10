'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WholesomeCard } from './wholesome-card';

interface WholesomeItem {
  title: string;
  name: string;
  img: string;
  hasRange: boolean;
  slug: string;
}

interface WholesomeCarouselProps {
  items: WholesomeItem[];
}

const getGradient = (title: string): string => {
  const gradients: Record<string, string> = {
    'Namkeen Range': 'linear-gradient(180deg, #F2B177 0%, #D6753A 100%)',
    'Roasted Range': 'linear-gradient(180deg, #E39956 0%, #FACA73 100%)',
    'South Range': 'linear-gradient(180deg, #B0CC7B 0%, #24AD5E 100%)',
    'Wafers Range': 'linear-gradient(180deg, #E9A0AD 0%, #D12C4A 100%)',
    'Puff Range': 'linear-gradient(180deg, #EAB07C 0%, #CB6000 100%)',
    'Muffin Range': 'linear-gradient(180deg, #b8b5eb 0%, #595782 100%)',
    'No Palm Oil Range': 'linear-gradient(180deg, #C7D6A0 0%, #A2C654 100%)',
    'Wheat Range': 'linear-gradient(180deg, #dec19f 0%, #b4824a 100%)',
    'No Maida Range': 'linear-gradient(180deg, #E9A0AD 0%, #D12C4A 100%)',
  };

  return gradients[title] || 'linear-gradient(180deg, #F3F4F6 0%, #E5E7EB 100%)';
};

export function WholesomeCarousel({ items }: WholesomeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = 300;
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollability);
      return () => scrollElement.removeEventListener('scroll', checkScrollability);
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -scrollByAmount : scrollByAmount,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <div className="relative overflow-visible mx-4">
        <div className="max-w-screen overflow-hidden">
          <div
            ref={scrollRef}
            className="relative overflow-x-auto hide-scrollbar scroll-smooth"
          >
            <div
              className="flex lg:gap-6 md:gap-5 gap-2.5 pr-4"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {items.map((item) => (
                <div
                  key={item.name}
                  className="scroll-snap-start flex-shrink-0 w-[130px] md:w-[190px] lg:w-[300px]"
                >
                  <WholesomeCard
                    title={item.title}
                    name={item.name}
                    img={item.img}
                    hasRange={item.hasRange}
                    slug={item.slug}
                    gradient={getGradient(item.title)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          className="static translate-y-0 flex justify-center items-center cursor-pointer w-10 h-10 lg:w-12 lg:h-12 border-2 border-gray-500 rounded-full bg-transparent hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
        </button>
        <button
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          className="static translate-y-0 flex justify-center items-center cursor-pointer w-10 h-10 lg:w-12 lg:h-12 border-2 border-gray-500 rounded-full bg-transparent hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
        </button>
      </div>
    </>
  );
}
