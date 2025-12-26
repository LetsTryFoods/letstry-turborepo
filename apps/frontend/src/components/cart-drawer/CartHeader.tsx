import React from 'react';
import { ShoppingCart, X } from 'lucide-react';

interface CartHeaderProps {
  itemCount: number;
  onClose: () => void;
}

export const CartHeader: React.FC<CartHeaderProps> = ({ itemCount, onClose }) => {
  return (
    <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 bg-white sticky top-0 z-10 rounded-t-[20px] md:rounded-t-none">
      <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <h2 className="text-xl font-bold text-black">
          Cart items ({itemCount} item)
        </h2>
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
