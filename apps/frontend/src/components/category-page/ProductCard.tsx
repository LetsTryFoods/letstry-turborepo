'use client'
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Badge } from './Badge';
import { PriceSection } from './PriceSection';
import { WeightSelector } from './WeightSelector';
import { AddToCartButton } from './AddToCartButton';
import { CartService } from '@/lib/cart/cart-service';
import { useAnalytics } from '@/hooks/use-analytics';
import { useCart } from '@/lib/cart/use-cart';
import Link from 'next/link';

export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  mrp?: number;
  variants: {
    id: string;
    weight: string;
    price: number;
    mrp?: number;
  }[];
  badge?: {
    label: string;
    variant: 'trending' | 'bestseller' | 'default';
  };
}

interface ProductCardProps {
  product: Product;
  categoryType?: 'default' | 'special';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, categoryType = 'default' }) => {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || product.id);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { trackAddToCart } = useAnalytics();
  const { data: cartData } = useCart();
  
  const cart = cartData?.myCart;
  const cartItem = cart?.items?.find((item: any) => item.variantId === selectedVariantId);
  const quantityInCart = cartItem?.quantity || 0;
  
  console.log('ProductCard Debug:', {
    productName: product.name,
    selectedVariantId,
    cartItems: cart?.items,
    cartItem,
    quantityInCart
  });
  
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || {
    price: product.price,
    mrp: product.mrp,
    weight: product.variants[0]?.weight
  };

  const weights = product.variants.map(v => v.weight);
  const selectedWeight = selectedVariant.weight;

  const handleWeightChange = (weight: string) => {
    const variant = product.variants.find(v => v.weight === weight);
    if (variant) {
      setSelectedVariantId(variant.id);
    }
  };

  const handleAddToCart = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await CartService.addToCart(selectedVariantId, 1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      trackAddToCart({
        id: selectedVariantId,
        name: product.name,
        price: selectedVariant.price,
        quantity: 1,
        variant: selectedVariant.weight,
      });
      
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
      await CartService.updateCartItem(selectedVariantId, quantityInCart + 1);
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
        await CartService.updateCartItem(selectedVariantId, quantityInCart - 1);
      } else {
        await CartService.removeFromCart(selectedVariantId);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-sm overflow-hidden flex flex-col h-full bg-white hover:shadow-md transition-shadow duration-200 relative group">
      <Link href={`/${product.slug}`} className="absolute inset-0 z-10" />
      <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 w-full bg-[#fdfbf7] flex items-center justify-center p-2 sm:p-3 md:p-4">
        {product.badge && (
          <Badge label={product.badge.label} variant={product.badge.variant} />
        )}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow text-center relative z-20 pointer-events-none">
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem] flex items-center justify-center pointer-events-auto">
          <Link href={`/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        
        <PriceSection price={selectedVariant.price} mrp={selectedVariant.mrp} />
        
        <div className="mt-auto w-full pointer-events-auto">
            <WeightSelector
            weights={weights}
            selectedWeight={selectedWeight}
            onWeightChange={handleWeightChange}
            />
            
            {quantityInCart === 0 ? (
              <AddToCartButton onClick={handleAddToCart} />
            ) : (
              <div className="mt-2 w-full flex items-center justify-between border-2 border-[#0C5273] rounded-lg overflow-hidden">
                <button
                  className="flex-1 py-2 text-[#0C5273] font-bold text-xl hover:bg-[#0C5273] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};
