import React from "react";

interface PriceSectionProps {
  price: number;
  mrp?: number;
  currencySymbol?: string;
}

export const PriceSection: React.FC<PriceSectionProps> = ({
  price,
  mrp,
  currencySymbol = "₹",
}) => {
  const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-0.5 mt-1 sm:mt-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-base sm:text-lg font-bold text-gray-900">
          {currencySymbol}
          {price.toFixed(2)}
        </span>
        {mrp && mrp > price && (
          <span className="text-xs sm:text-sm text-gray-500 line-through font-medium">
            {currencySymbol}
            {mrp.toFixed(2)}
          </span>
        )}
      </div>
      {discount > 0 && (
        <span className="text-[11px] sm:text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
          {discount}% OFF
        </span>
      )}
    </div>
  );
};
