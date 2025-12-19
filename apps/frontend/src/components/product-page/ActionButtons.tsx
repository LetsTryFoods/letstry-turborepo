"use client";

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { CartService } from '@/lib/cart/cart-service';

interface ActionButtonsProps {
  product: {
    id: string;
    name: string;
    price: number;
    variantName?: string;
  };
  isOutOfStock?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ product, isOutOfStock = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAddToCart = async () => {
    if (isOutOfStock || isLoading) return;
    
    setIsLoading(true);
    try {
      await CartService.addToCart(product.id, 1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    console.log('Buy now:', product);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
        className={cn(
          "w-full py-3 px-6 border-2 border-[#0f3455] text-[#0f3455] text-lg font-bold rounded-lg transition-colors uppercase tracking-wide",
          isOutOfStock || isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
        )}
      >
        {isLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to cart'}
      </button>
      <button
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className={cn(
          "w-full py-3 px-6 bg-[#0f3455] text-white text-lg font-bold rounded-lg transition-colors uppercase tracking-wide shadow-md",
          isOutOfStock ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1a4b75]"
        )}
      >
        Buy Now
      </button>
    </div>
  );
};
