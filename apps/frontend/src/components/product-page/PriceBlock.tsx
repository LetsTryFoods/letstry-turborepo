import React from "react";

interface PriceBlockProps {
  price: number;
  mrp?: number;
  currency?: string;
}

export const PriceBlock: React.FC<PriceBlockProps> = ({
  price,
  mrp,
  currency = "₹",
}) => {
  const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
      <div className="flex items-baseline gap-1.5 sm:gap-2">
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          {currency} {price}
        </span>
        {mrp && mrp > price && (
          <>
            <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">
              {currency} {mrp}
            </span>
            <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              {discount}% OFF
            </span>
          </>
        )}
      </div>
      <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-0.5 sm:mt-1">
        Tax included. Shipping calculated at checkout.
      </p>
    </div>
  );
};
