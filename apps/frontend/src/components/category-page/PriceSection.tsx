import React from 'react';

interface PriceSectionProps {
  price: number;
  mrp?: number;
  currencySymbol?: string;
}

export const PriceSection: React.FC<PriceSectionProps> = ({
  price,
  mrp,
  currencySymbol = '₹',
}) => {
  const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="flex items-center gap-2">
        <span className="text-md font-bold text-gray-900">
          {currencySymbol}{price.toFixed(2)}
        </span>
        {mrp && mrp > price && (
          <span className="text-sm text-gray-500 line-through">
            {currencySymbol}{mrp.toFixed(2)}
          </span>
        )}
      </div>
      {discount > 0 && (
        <span className="text-sm font-medium text-[#16a34a]">
          {discount}% OFF
        </span>
      )}
    </div>
  );
};
