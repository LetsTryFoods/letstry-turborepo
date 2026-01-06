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
  images?: Array<{ url: string; alt: string }>;
};

type BestsellerProduct = {
  _id: string;
  name: string;
  slug: string;
  defaultVariant: ProductVariant | null;
  variants?: ProductVariant[];
};

type BestsellerCardProps = {
  product: BestsellerProduct;
};

export const BestsellerCard = ({ product }: BestsellerCardProps) => {
  const variant = product.defaultVariant;
  if (!variant) return null;

  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const images = variant.images?.slice(0, 4) || [];
  const displayImages = images.length > 0 ? images : [{ url: variant.thumbnailUrl, alt: product.name }];

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
    <article className="flex flex-col border border-gray-300 rounded-lg p-4 bg-gray-50 hover:shadow-lg transition-shadow">
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full aspect-square mb-4 bg-white rounded overflow-hidden">
          <Image
            src={displayImages[0].url}
            alt={displayImages[0].alt || product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        </div>
        <h3 className="text-base font-semibold text-center text-gray-900 line-clamp-2 min-h-[48px] mb-2">
          {product.name}
        </h3>
      </Link>
      <div className="flex items-center justify-center mb-3">
        <span className="text-lg font-bold text-gray-900">
          Rs {variant.price.toFixed(2)}
        </span>
      </div>
      {quantity === 0 ? (
        <button
          className="w-full border-2 border-blue-600 text-blue-600 text-sm font-semibold py-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add to cart'}
        </button>
      ) : (
        <div className="w-full flex items-center justify-between border-2 border-blue-600 rounded-md overflow-hidden">
          <button
            className="flex-1 py-2 text-blue-600 font-bold text-xl hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDecrement}
            disabled={isLoading}
          >
            −
          </button>
          <span className="flex-1 text-center py-2 text-blue-600 font-semibold text-base border-x-2 border-blue-600">
            {isLoading ? '...' : quantity}
          </span>
          <button
            className="flex-1 py-2 text-blue-600 font-bold text-xl hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
