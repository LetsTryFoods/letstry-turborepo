import React from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';

interface CartItemProps {
  id: string;
  image: string;
  title: string;
  size: string;
  price: number;
  quantity: number;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  id,
  image,
  title,
  size,
  price,
  quantity,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="flex gap-4 p-4 bg-white mb-4">
      <div className="relative w-24 h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
        <Image
          src="https://d11a0m43ek7ap8.cloudfront.net/8bbbe150d5da51d6950bd2b576696a63.webp"
          alt={title}
          fill
          className="object-contain p-2"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">Size: {size}</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">₹ {price}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-blue-200 rounded-md bg-blue-50/50">
            <button
              onClick={() => onUpdateQuantity(id, Math.max(0, quantity - 1))}
              className="p-1.5 hover:bg-blue-100 text-blue-800 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-900">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(id, quantity + 1)}
              className="p-1.5 hover:bg-blue-100 text-blue-800 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(id)}
            className="text-xs text-gray-500 hover:text-red-500 underline decoration-gray-300 hover:decoration-red-500 underline-offset-2 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
