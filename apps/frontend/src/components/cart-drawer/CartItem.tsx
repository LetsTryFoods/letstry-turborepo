import React from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { getCdnUrl } from '@/lib/image-utils';

interface CartItemProps {
  id: string;
  image: string;
  title: string;
  size: string;
  price: number;
  quantity: number;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
  isUpdating?: boolean;
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
  isUpdating = false,
}) => {
  return (
    <div className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl mb-4">
      <div className="relative w-24 h-28 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
        <Image
          src={getCdnUrl(image)}
          alt={title}
          fill
          className="object-contain p-2"
          sizes="96px"
        />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-base font-bold text-black line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-600">Size: {size}</p>
        </div>

        <div className="mt-auto">
          <p className="text-lg font-bold text-black mb-2">₹ {price}</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-[#003B65] rounded-sm overflow-hidden h-8">
              <button
                onClick={() => onUpdateQuantity(id, Math.max(0, quantity - 1))}
                className="px-3 h-full bg-[#E8F3F7] text-[#003B65] hover:bg-[#D1E9F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
                disabled={isUpdating}
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="w-10 text-center text-sm font-bold text-black">{quantity}</span>
              <button
                onClick={() => onUpdateQuantity(id, quantity + 1)}
                className="px-3 h-full bg-[#E8F3F7] text-[#003B65] hover:bg-[#D1E9F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
                disabled={isUpdating}
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>

            <button
              onClick={() => onRemove(id)}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdating}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
