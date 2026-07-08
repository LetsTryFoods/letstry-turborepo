"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { getCdnUrl } from "@/lib/image-utils";
import { CartService } from "@/lib/cart/cart-service";
import { useCart } from "@/lib/cart/use-cart";
import { useAnalytics } from "@/hooks/use-analytics";

interface Product {
  _id: string;
  name: string;
  slug: string;
  defaultVariant?: {
    discountPercent: number;
    price: number;
    mrp: number;
    thumbnailUrl: string;
    packageSize: string;
  } | null;
}

interface CategoryProductCardProps {
  product: Product;
  categorySlug: string;
}

export const CategoryProductCard: React.FC<CategoryProductCardProps> = ({
  product,
  categorySlug,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const cartQuery = useCart();
  const { trackAddToCart, trackRemoveFromCart } = useAnalytics();

  const variant = product.defaultVariant;
  if (!variant) return null;

  const cartItems = cartQuery.data?.myCart?.items || [];
  const quantityInCart =
    cartItems.find((item) => item.productId === product._id)?.quantity || 0;

  const displayImage =
    getCdnUrl(variant.thumbnailUrl) || "/placeholder-image.svg";

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
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
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
      await CartService.updateCartItem(product._id, quantityInCart + 1);
      trackAddToCart({
        id: product._id,
        name: product.name,
        price: variant.price,
        quantity: 1,
        variant: variant.packageSize,
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
        await CartService.updateCartItem(product._id, quantityInCart - 1);
      } else {
        await CartService.removeFromCart(product._id);
      }
      trackRemoveFromCart({
        id: product._id,
        name: product.name,
        price: variant.price,
        quantity: 1,
        variant: variant.packageSize,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error("Failed to update cart");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="flex flex-col border border-gray-300 rounded-lg bg-gray-50 hover:shadow-lg transition-shadow">
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full aspect-square sm:mb-4 mb-2 rounded overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 240px"
          />
        </div>
        <h3 className="text-[13px] sm:text-sm md:text-base font-semibold text-gray-800 text-center line-clamp-2 leading-snug min-h-[2.5rem] mt-1 sm:mt-2 px-1">
          {product.name}
        </h3>
        <div className="text-[10px] sm:text-xs font-semibold text-center text-gray-500 uppercase tracking-wider mt-1 mb-2">
          {variant.packageSize}
        </div>
      </Link>
      <div className="flex flex-col items-center justify-center sm:mb-2 mb-1 gap-0.5 mt-1 sm:mt-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ₹{variant.price.toFixed(2)}
          </span>
          {variant.mrp && variant.mrp > variant.price && (
            <span className="text-[11px] sm:text-sm text-gray-500 line-through font-medium px-1">
              ₹{variant.mrp.toFixed(2)}
            </span>
          )}
        </div>
        {variant?.discountPercent > 0 && (
          <span className="text-[11px] sm:text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm uppercase tracking-wide mt-0.5">
            {variant?.discountPercent}% OFF
          </span>
        )}
      </div>
      <div className="px-2 sm:px-4 pb-2 sm:pb-4 mt-auto">
        {quantityInCart === 0 ? (
          <button
            className="w-full h-8 sm:h-10 flex items-center justify-center text-[13px] sm:text-sm cursor-pointer border sm:border-2 border-brand-hover text-brand-hover font-semibold rounded-md transition-colors duration-200 uppercase tracking-wide hover:bg-brand-hover hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add to cart"}
          </button>
        ) : (
          <div className="mt-auto h-8 sm:h-10 w-full flex items-center justify-between border sm:border-2 border-brand-hover rounded-md overflow-hidden bg-[#D1E9F2]">
            <button
              className="w-10 sm:w-12 h-full text-brand-hover font-bold text-lg sm:text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center hover:bg-[#b5dbe9]"
              onClick={handleDecrement}
              disabled={isLoading}
            >
              −
            </button>
            <span className="flex-1 h-full text-center text-brand-hover font-bold text-[13px] sm:text-sm flex items-center justify-center bg-white">
              {isLoading ? "..." : quantityInCart}
            </span>
            <button
              className="w-10 sm:w-12 h-full text-brand-hover font-bold text-lg sm:text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center hover:bg-[#b5dbe9]"
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
