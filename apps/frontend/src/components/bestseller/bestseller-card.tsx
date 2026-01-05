"use client";
import { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Image from "next/image";
import Link from "next/link";
import { CartService } from '@/lib/cart/cart-service';

type ProductVariant = {
  _id: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  discountPercent: number;
  thumbnailUrl: string;
  packageSize: string;
  stockQuantity: number;
};

type BestsellerProduct = {
  _id: string;
  name: string;
  slug: string;
  defaultVariant: ProductVariant | null;
};

type BestsellerCardProps = {
  product: BestsellerProduct;
};

export const BestsellerCard = ({ product }: BestsellerCardProps) => {
  const variant = product.defaultVariant;
  if (!variant) return null;

  const hasDiscount = variant.discountPercent > 0;
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAddToCart = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await CartService.addToCart(product._id, 1);
      setQuantity(1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newQuantity = quantity + 1;
      await CartService.updateCartItem(product._id, newQuantity);
      setQuantity(newQuantity);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (quantity > 1) {
        const newQuantity = quantity - 1;
        await CartService.updateCartItem(product._id, newQuantity);
        setQuantity(newQuantity);
      } else {
        await CartService.removeFromCart(product._id);
        setQuantity(0);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="relative flex flex-col rounded-xl bg-[#FCEFC0] p-6 min-w-[200px]">
      {hasDiscount && (
        <span className="absolute top-0 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-b-md">
          {variant.discountPercent}%
          <br />
          OFF
        </span>
      )}
      <Link href={`/product/${product.slug}`}>
        <figure className="flex items-center justify-center h-48 mb-4">
          <Image
            src={variant.thumbnailUrl}
            alt={product.name}
            width={160}
            height={160}
            className="object-contain max-h-full"
          />
        </figure>
        <h3 className="text-lg font-bold text-center text-gray-900 line-clamp-2 min-h-[56px]">
          {product.name}
        </h3>
        <p className="text-sm text-center text-gray-600 mt-1">{variant.packageSize}</p>
      </Link>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-lg font-bold text-gray-900">
          ₹{variant.price.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="text-sm text-gray-500 line-through">
            MRP ₹{variant.mrp.toFixed(2)}
          </span>
        )}
      </div>
      {quantity === 0 ? (
        <button
          style={{
            backgroundRepeat: 'repeat-x',
            backgroundPosition: '0 -100%',
            transition: 'background-position 1s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = '150% 100%')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = '0 -100%')}
          className="mt-4 w-full border-2 border-[#0C5273] text-[#0C5273] text-base font-semibold py-2 rounded-lg hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add to cart'}
        </button>
      ) : (
        <div className="mt-4 w-full flex items-center justify-between border-2 border-[#0C5273] rounded-lg overflow-hidden">
          <button
            className="flex-1 py-2 text-[#0C5273] font-bold text-xl hover:bg-[#0C5273] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDecrement}
            disabled={isLoading}
          >
            −
          </button>
          <span className="flex-1 text-center py-2 text-[#0C5273] font-semibold text-base border-x-2 border-[#0C5273]">
            {isLoading ? '...' : quantity}
          </span>
          <button
            className="flex-1 py-2 text-[#0C5273] font-bold text-xl hover:bg-[#0C5273] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleIncrement}
            disabled={isLoading}
          >
            +
          </button>
        </div>
      )}
    </article>
  );
};
