"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { CartService } from "@/lib/cart/cart-service";
import { useAnalytics } from "@/hooks/use-analytics";
import { useCart } from "@/lib/cart/use-cart";

interface ActionButtonsProps {
  product: {
    id: string;
    name: string;
    price: number;
    variantName?: string;
    variants?: Array<{ id: string; price: number; weight?: string }>;
    defaultVariant?: { id: string; price: number; weight?: string };
  };
  isOutOfStock?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  product,
  isOutOfStock = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { trackAddToCart, trackRemoveFromCart } = useAnalytics();
  const cartQuery = useCart();

  // Use defaultVariant or fallback to product.id
  const variant = product.defaultVariant || {
    id: product.id,
    price: product.price,
    weight: product.variantName,
  };
  const variantId = variant.id;
  const cartItems = cartQuery.data?.myCart?.items || [];
  // Match by variantId if present, fallback to productId for non-variant products
  const cartItem = cartItems.find((item) =>
    item.variantId
      ? item.variantId === variantId
      : item.productId === variantId,
  );
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || isLoading) return;
    setIsLoading(true);
    try {
      await CartService.addToCart(variantId, 1);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      trackAddToCart({
        id: variantId,
        name: product.name,
        price: variant.price,
        quantity: 1,
        variant: variant.weight,
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
      await CartService.updateCartItem(variantId, quantityInCart + 1);
      trackAddToCart({
        id: variantId,
        name: product.name,
        price: variant.price,
        quantity: 1,
        variant: variant.weight,
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
        await CartService.updateCartItem(variantId, quantityInCart - 1);
      } else {
        await CartService.removeFromCart(variantId);
      }
      trackRemoveFromCart({
        id: variantId,
        name: product.name,
        price: variant.price,
        quantity: 1,
        variant: variant.weight,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error("Failed to update cart");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {isOutOfStock ? (
        <button
          disabled
          className={cn(
            "cursor-not-allowed w-full py-1 sm:py-2 px-4 border border-brand-hover text-brand-hover text-lg font-bold rounded-lg transition-colors uppercase tracking-wide opacity-50",
          )}
        >
          Out of Stock
        </button>
      ) : quantityInCart === 0 ? (
        <button
          onClick={isLoading ? undefined : handleAddToCart}
          disabled={isLoading}
          className={cn(
            "cursor-pointer w-full py-1 sm:py-2 px-4 border border-brand-hover text-brand-hover text-lg font-bold rounded-lg transition-colors uppercase tracking-wide",
            isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-brand-hover hover:text-white",
          )}
        >
          {isLoading ? "Adding..." : "Add to cart"}
        </button>
      ) : (
        <div className="w-full flex items-center justify-between border sm:border-2 border-[#0C5273] rounded-md overflow-hidden">
          <button
            className="flex-1 py-1 border-[#0C5273] bg-[#D1E9F2] font-bold text-xl transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDecrement}
            disabled={isLoading}
          >
            −
          </button>
          <span className="flex-1 text-center py-1 text-[#0C5273] font-semibold text-base">
            {isLoading ? "..." : quantityInCart}
          </span>
          <button
            className="flex-1 py-1 text-[#0C5273 bg-[#D1E9F2] font-bold text-xl transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleIncrement}
            disabled={isLoading}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};
