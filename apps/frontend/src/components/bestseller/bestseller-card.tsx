"use client";
import { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Image from "next/image";
import Link from "next/link";
import { CartService } from '@/lib/cart/cart-service';
import { useAnalytics } from '@/hooks/use-analytics';
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
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { trackAddToCart } = useAnalytics();
  const { data: cartData } = useCart();
  
  const cart = cartData?.myCart;
  const cartItem = cart?.items?.find((item: any) => item.productId === product._id);
  const quantityInCart = cartItem?.quantity || 0;
  
  console.log('BestsellerCard Debug:', {
    productName: product.name,
    productId: product._id,
    cartItems: cart?.items,
    cartItem,
    quantityInCart
  });

  const handleAddToCart = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await CartService.addToCart(product._id, 1);
      
      trackAddToCart({
        id: product._id,
        name: product.name,
        price: variant.price,
        quantity: 1,
        variant: variant.packageSize,
      });
      
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
    <article className="relative flex flex-col rounded-xl bg-[#FCEFC0] p-3 sm:p-4 md:p-5 lg:p-6 h-full">
      {hasDiscount && (
        <span className="absolute top-0 left-2 sm:left-4 z-10 bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-b-md">
          {variant.discountPercent}%
          <br />
          OFF
        </span>
      )}
      <Link href={`/${product.slug}`}>
        <figure className="flex items-center justify-center h-32 sm:h-40 md:h-44 lg:h-48 mb-2 sm:mb-3 md:mb-4">
          <Image
            src={variant.thumbnailUrl}
            alt={product.name}
            width={160}
            height={160}
            className="object-contain max-h-full w-auto"
          />
        </figure>
        <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-center text-gray-900 line-clamp-2 min-h-[32px] sm:min-h-[40px] md:min-h-[48px] lg:min-h-[56px]">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs md:text-sm text-center text-gray-600 mt-0.5 sm:mt-1">{variant.packageSize}</p>
      </Link>
      <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1 sm:mt-2">
        <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
          ₹{variant.price.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="text-xs sm:text-sm text-gray-500 line-through">
            MRP ₹{variant.mrp.toFixed(2)}
          </span>
        )}
      </div>
      {quantityInCart === 0 ? (
        <button
          style={{
            backgroundRepeat: 'repeat-x',
            backgroundPosition: '0 -100%',
            transition: 'background-position 1s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = '150% 100%')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = '0 -100%')}
          className="mt-2 sm:mt-3 md:mt-4 w-full border-2 border-[#0C5273] text-[#0C5273] text-xs sm:text-sm md:text-base font-semibold py-1.5 sm:py-2 rounded-lg hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add to cart'}
        </button>
      ) : (
        <div className="mt-2 sm:mt-3 md:mt-4 w-full flex items-center justify-between border-2 border-[#0C5273] rounded-lg overflow-hidden">
          <button
            className="flex-1 py-1.5 sm:py-2 text-[#0C5273] font-bold text-lg sm:text-xl hover:bg-[#0C5273] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDecrement}
            disabled={isLoading}
          >
            −
          </button>
          <span className="flex-1 text-center py-1.5 sm:py-2 text-[#0C5273] font-semibold text-sm sm:text-base border-x-2 border-[#0C5273]">
            {isLoading ? '...' : quantityInCart}
          </span>
          <button
            className="flex-1 py-1.5 sm:py-2 text-[#0C5273] font-bold text-lg sm:text-xl hover:bg-[#0C5273] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
