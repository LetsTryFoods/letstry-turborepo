import React from 'react';
import { ShoppingCart, X } from 'lucide-react';

interface CartHeaderProps {
  itemCount: number;
  onClose: () => void;
}

export const CartHeader: React.FC<CartHeaderProps> = ({ itemCount, onClose }) => {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <ShoppingCart size={24} className="text-gray-900" />
        <h2 className="text-lg font-semibold text-gray-900">
          Cart items ({itemCount} item)
        </h2>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close cart"
      >
        <X size={24} className="text-gray-500" />
      </button>
    </div>
  );
};
