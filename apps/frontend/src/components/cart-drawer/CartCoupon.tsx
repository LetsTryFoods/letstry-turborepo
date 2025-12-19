import React from 'react';
import { Tag, ChevronRight } from 'lucide-react';

interface CartCouponProps {
  onClick?: () => void;
}

export const CartCoupon: React.FC<CartCouponProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-[#FFF9C4] px-4 py-3 rounded-lg mb-6 hover:bg-[#FFF59D] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-1.5 rounded-full text-white">
          <Tag size={16} className="fill-current" />
        </div>
        <span className="font-semibold text-gray-900">View Coupons</span>
      </div>
      <ChevronRight size={20} className="text-gray-900" />
    </button>
  );
};
