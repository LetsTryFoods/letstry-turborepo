import React from "react";
import { Tag, Trash2 } from "lucide-react";

interface AppliedCouponProps {
  code: string;
  discountAmount: number;
  onRemove: () => void;
}

export const AppliedCoupon: React.FC<AppliedCouponProps> = ({
  code,
  discountAmount,
  onRemove,
}) => {
  return (
    <div className="bg-[#f2f8f2] border-l-4 border-[#2e7d32] p-4 rounded-r-lg mb-6 flex items-start justify-between relative group">
      <div className="flex gap-4">
        <div className="mt-1">
          <Tag className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-[#2e7d32] text-sm uppercase">
              Coupon Applied: {code}
            </h4>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Promo code applied successfully.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between h-full min-h-[40px]">
        <span className="font-bold text-sm text-black">-₹{discountAmount}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-red-500 transition-colors mt-2"
          aria-label="Remove coupon"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
