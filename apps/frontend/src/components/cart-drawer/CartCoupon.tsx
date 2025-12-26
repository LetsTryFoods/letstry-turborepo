import React from 'react';
import { Tag, ChevronRight } from 'lucide-react';

interface CartCouponProps {
  onClick?: () => void;
}

export const CartCoupon: React.FC<CartCouponProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-[#FFF9C4] px-4 py-4 rounded-lg mb-6 hover:bg-[#FFF59D] transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="bg-[#4CAF50] p-2 rounded-lg text-white">
          <Tag size={20} className="fill-current" />
        </div>
        <span className="text-lg font-bold text-black">View Coupons</span>
      </div>
      <ChevronRight size={24} className="text-black" />
    </button>
  );
};
