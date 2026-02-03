"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { CartService } from "@/lib/cart/cart-service";
import { useCart } from "@/lib/cart/use-cart";

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

  const variant = product.defaultVariant;
  if (!variant) return null;

  const cartItems = cartQuery.data?.myCart?.items || [];
  const quantityInCart =
    cartItems.find((item) => item.productId === product._id)?.quantity || 0;

  const displayImage = variant.thumbnailUrl || "/placeholder-image.svg";

  const handleAddToCart = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await CartService.addToCart(product._id, 1);
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
        <div className="relative w-full aspect-square sm:mb-4 mb-2 bg-[#F3EEEA] rounded overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-contain p-4 sm:p-6"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        </div>
        <h3 className="sm:text-base text-sm font-semibold text-center text-gray-900 line-clamp-2 sm:min-h-12 min-h-6 ">
          {product.name}
        </h3>
      </Link>
      <div className="flex flex-col items-center justify-center sm:mb-2 mb-1 gap-1">
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
        {variant?.discountPercent > 0 && (
          <span className="text-xs font-medium text-[#16a34a]">
            {variant?.discountPercent}% OFF
          </span>
        )}
      </div>
      <div className="px-4 pb-4 mt-2">
        {quantityInCart === 0 ? (
          <button
            className="w-full border sm:border-2 border-brand-hover text-brand-hover text-sm font-semibold py-1 sm:py-2 rounded-md hover:bg-brand-hover hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add to cart"}
          </button>
        ) : (
          <div className="w-full flex items-center justify-between border sm:border-2 border-brand-hover rounded-md overflow-hidden">
            <button
              className="flex-1 py-1 bg-[#D1E9F2] border-brand-hover font-bold text-xl  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDecrement}
              disabled={isLoading}
            >
              −
            </button>
            <span className="flex-1 text-center py-1 text-brand-hover font-semibold text-base">
              {isLoading ? "..." : quantityInCart}
            </span>
            <button
              className="flex-1 py-1 bg-[#D1E9F2] text-brand-hover font-bold text-xl  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
