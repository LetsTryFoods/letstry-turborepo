import React from 'react';

interface PriceBlockProps {
  price: number;
  mrp?: number;
  currency?: string;
}

export const PriceBlock: React.FC<PriceBlockProps> = ({ price, mrp, currency = '₹' }) => {
  const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{currency} {price}</span>
        {mrp && mrp > price && (
          <>
            <span className="text-lg text-gray-500 line-through">{currency} {mrp}</span>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              {discount}% OFF
            </span>
          </>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-1">Tax included. Shipping calculated at checkout.</p>
    </div>
  );
};
