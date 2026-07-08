"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import { Badge } from "./Badge";
import { PriceSection } from "./PriceSection";
import { WeightSelector } from "./WeightSelector";
import { AddToCartButton } from "./AddToCartButton";
import { CartService } from "@/lib/cart/cart-service";
import { useAnalytics } from "@/hooks/use-analytics";
import { useCart } from "@/lib/cart/use-cart";
import Link from "next/link";
import { getCdnUrl } from "@/lib/image-utils";

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
    isOutOfStock?: boolean;
  }[];
  badge?: {
    label: string;
    variant: "trending" | "bestseller" | "default";
  };
}

interface ProductCardProps {
  product: Product;
  categoryType?: "default" | "special";
  slug?: string;
  listId?: string;
  listName?: string;
  position?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryType = "default",
  slug,
  listId,
  listName,
  position,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || product.id,
  );
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { trackAddToCart, trackSelectItem, trackRemoveFromCart } =
    useAnalytics();

  const handleSelectItem = () => {
    trackSelectItem({
      id: product.id,
      name: product.name,
      price: product.price,
      listName: listName,
      position,
    });
  };
  const { data: cartData } = useCart();

  const cart = cartData?.myCart;
  const cartItem = cart?.items?.find(
    (item: any) => item.variantId === selectedVariantId,
  );
  const quantityInCart = cartItem?.quantity || 0;

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId,
  ) || {
    price: product.price,
    mrp: product.mrp,
    weight: product.variants[0]?.weight,
    isOutOfStock: product.variants[0]?.isOutOfStock,
  };

  const isOutOfStock = selectedVariant.isOutOfStock || false;

  const weights = product.variants.map((v) => v.weight);
  const selectedWeight = selectedVariant.weight;

  const handleWeightChange = (weight: string) => {
    const variant = product.variants.find((v) => v.weight === weight);
    if (variant) {
      setSelectedVariantId(variant.id);
    }
  };

  const handleAddToCart = async () => {
    if (isLoading || isOutOfStock) return;

    setIsLoading(true);
    try {
      await CartService.addToCart(selectedVariantId, 1);
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      trackAddToCart({
        id: selectedVariantId,
        name: product.name,
        price: selectedVariant.price,
        quantity: 1,
        variant: selectedVariant.weight,
      });

      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await CartService.updateCartItem(selectedVariantId, quantityInCart + 1);
      trackAddToCart({
        id: selectedVariantId,
        name: product.name,
        price: selectedVariant.price,
        quantity: 1,
        variant: selectedVariant.weight,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error("Failed to update cart");
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
      trackRemoveFromCart({
        id: selectedVariantId,
        name: product.name,
        price: selectedVariant.price,
        quantity: 1,
        variant: selectedVariant.weight,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error("Failed to update cart");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-sm overflow-hidden flex flex-col h-full bg-white hover:shadow-md transition-shadow duration-200 relative group">
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-10"
        aria-label={product.name}
        onClick={handleSelectItem}
      />
      {/* aspect-square on mobile = container matches product image shape (no stretch/squish) */}
      <div className="relative aspect-square sm:aspect-auto sm:h-48 md:h-56 lg:h-64 w-full bg-[#fdfbf7] overflow-hidden">
        {product.badge && (
          <Badge label={product.badge.label} variant={product.badge.variant} />
        )}
        <div className="relative w-full h-full">

          <Image
            //correct this in search page also
            src={getCdnUrl(product.image)}
            alt={product.name}
            fill
            className="object-center"
            loading="lazy"
            quality={75}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </div>

      <div className="p-1.5 sm:p-3 md:p-4 flex flex-col flex-grow text-center relative z-20 pointer-events-none">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.5rem] flex items-center justify-center pointer-events-auto mt-1 sm:mt-2 px-1">
          <Link href={`/product/${product.slug}`} onClick={handleSelectItem}>
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

          {isOutOfStock ? (
            <button
              disabled
              className="w-full h-8 sm:h-10 flex items-center justify-center text-[13px] sm:text-sm cursor-pointer mt-1 mb-1 sm:mt-4 border sm:border-2 border-[#0C5273] text-[#0C5273] font-semibold rounded-md cursor-not-allowed opacity-50 uppercase tracking-wide"
            >
              Out of Stock
            </button>
          ) : quantityInCart === 0 ? (
            <AddToCartButton onClick={handleAddToCart} />
          ) : (
            <div className="mt-1 mb-1 sm:mt-4 h-8 sm:h-10 w-full flex items-center justify-between border sm:border-2 border-[#0C5273] rounded-md overflow-hidden bg-[#D1E9F2]">
              <button
                className="w-10 sm:w-12 h-full text-[#0C5273] font-bold text-lg sm:text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center hover:bg-[#b5dbe9]"
                onClick={handleDecrement}
                disabled={isLoading}
              >
                −
              </button>
              <span className="flex-1 h-full text-center text-[#0C5273] font-bold text-[13px] sm:text-sm flex items-center justify-center bg-white">
                {isLoading ? "..." : quantityInCart}
              </span>
              <button
                className="w-10 sm:w-12 h-full text-[#0C5273] font-bold text-lg sm:text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center hover:bg-[#b5dbe9]"
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
