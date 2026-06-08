import React from "react";
import { ShoppingCart, X } from "lucide-react";

interface CartHeaderProps {
  itemCount: number;
  onClose: () => void;
  savings?: number;
}

export const CartHeader: React.FC<CartHeaderProps> = ({
  itemCount,
  onClose,
  savings,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 bg-white sticky top-0 z-10 rounded-t-[20px] md:rounded-t-none">
      <div className="flex items-center gap-3">
        <ShoppingCart size={32} strokeWidth={1.5} className="text-black" />
        <h2 className="text-xl font-bold text-black">
          Cart items ({itemCount} item)
        </h2>
        {savings && savings > 0 && (
          <div className="bg-[#E8F5E9] text-[#2E7D32] px-3 py-1 rounded-full text-sm font-bold">
            Saved ₹{savings}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close cart"
      >
        <X size={28} className="text-gray-500" />
      </button>
    </div>
  );
};
