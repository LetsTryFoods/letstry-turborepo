'use client';

import { useRef } from 'react';
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
    'Muffins & Cakes': 'linear-gradient(180deg, #B8B5EB 0%, #595782 100%)',
    'No Palm Oil Range': 'linear-gradient(180deg, #C7D6A0 0%, #A2C654 100%)',
    'Goodness of Wheat': 'linear-gradient(180deg, #DEC19F 0%, #B4824A 100%)',
    'No Maida Range': 'linear-gradient(180deg, #BFE9EC 0%, #449095 100%)',
  };

  return gradients[title] || 'linear-gradient(180deg, #F3F4F6 0%, #E5E7EB 100%)';
};

export function WholesomeCarousel({ items }: WholesomeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = 300;

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

      <div className="flex justify-center space-x-10 mt-6">
        <button
          onClick={() => handleScroll('left')}
          className="border-2 border-[#807171] rounded-full flex items-center justify-center w-6 h-6 md:w-10 md:h-10 lg:hover:bg-gray-100 transition-all duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-3 h-3 md:w-5 md:h-5" />
        </button>
        <button
          onClick={() => handleScroll('right')}
          className="border-2 border-[#807171] rounded-full flex items-center justify-center w-6 h-6 md:w-10 md:h-10 lg:hover:bg-gray-100 transition-all duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3 h-3 md:w-5 md:h-5" />
        </button>
      </div>
    </>
  );
}
