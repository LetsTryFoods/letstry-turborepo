"use client";
import { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Image from "next/image";
import Link from "next/link";
import { CartService } from '@/lib/cart/cart-service';
import { useCart } from '@/lib/cart/use-cart';

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
  categorySlug?: string;
};

type BestsellerCardProps = {
  product: BestsellerProduct;
};

export const BestsellerCard = ({ product }: BestsellerCardProps) => {
  const variant = product.defaultVariant;
  if (!variant) return null;

  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: cartData } = useCart();

  const cart = cartData?.myCart;
  const cartItem = cart?.items?.find((item: any) => item.productId === product._id);
  const quantityInCart = cartItem?.quantity || 0;



  const images = variant.images?.slice(0, 4) || [];
  const displayImages = images.length > 0 ? images : [{ url: variant.thumbnailUrl, alt: product.name }];

  const handleAddToCart = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await CartService.addToCart(product._id, 1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await CartService.updateCartItem(product._id, quantityInCart + 1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (quantityInCart > 1) {
        await CartService.updateCartItem(product._id, quantityInCart - 1);
      } else {
        await CartService.removeFromCart(product._id);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="flex flex-col border border-gray-300 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow">
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full aspect-square mb-4 bg-[#F3EEEA] rounded overflow-hidden">
          <Image
            src={displayImages[0].url}
            alt={displayImages[0].alt || product.name}
            fill
            className="object-contain p-4 sm:p-6"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        </div>
        <h3 className="text-base font-semibold text-center text-gray-900 line-clamp-2 min-h-[48px] p-2">
          {product.name}
        </h3>
        <h4 className="text-sm pb-1 text-center text-gray-600">{variant.packageSize}</h4>
      </Link>
      <div className="flex flex-col items-center justify-center mb-2 gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            ₹{variant.price.toFixed(2)}
          </span>
          {variant.mrp && variant.mrp > variant.price && (
            <span className="text-xs text-gray-500 line-through">
              ₹{variant.mrp.toFixed(2)}
            </span>
          )}
        </div>
        {variant.discountPercent > 0 && (
          <span className="text-xs font-medium text-[#16a34a]">
            {variant.discountPercent}% OFF
          </span>
        )}
      </div>
      <div className="px-4 pb-4 mt-auto">
        {quantityInCart === 0 ? (
          <button
            className="cursor-pointer w-full border-2 border-[#0C5273] text-[#0C5273] text-sm font-semibold py-2 rounded-md hover:bg-[#0C5273] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add to cart'}
          </button>
        ) : (
          <div className="w-full flex items-center justify-between border-2 border-[#0C5273] rounded-md overflow-hidden">
            <button
              className="flex-1 py-2 border-[#0C5273]  font-bold text-xl hover:bg-[#0C5273] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDecrement}
              disabled={isLoading}
            >
              −
            </button>
            <span className="flex-1 text-center py-2 text-[#0C5273] font-semibold text-base border-x-2 border-[#0C5273]">
              {isLoading ? '...' : quantityInCart}
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
      </div>
    </article>
  );
};
