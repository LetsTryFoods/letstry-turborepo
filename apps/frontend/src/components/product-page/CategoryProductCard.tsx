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
        <div className="relative w-full aspect-square mb-4 bg-[#F3EEEA] rounded overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-contain p-4 sm:p-6"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        </div>
        <h3 className="text-base font-semibold text-center text-gray-900 line-clamp-2 min-h-12 p-2">
          {product.name}
        </h3>
      </Link>
      <div className="flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900">
          Rs {variant.price.toFixed(2)}
        </span>
      </div>
      <div className="px-4 pb-4 mt-2">
        {quantityInCart === 0 ? (
          <button
            className="w-full border-2 border-brand-hover text-brand-hover text-sm font-semibold py-2 rounded-md hover:bg-brand-hover hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add to cart"}
          </button>
        ) : (
          <div className="w-full flex items-center justify-between border-2 border-brand-hover rounded-md overflow-hidden">
            <button
              className="flex-1 py-2 border-brand-hover font-bold text-xl hover:bg-brand-hover hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDecrement}
              disabled={isLoading}
            >
              −
            </button>
            <span className="flex-1 text-center py-2 text-brand-hover font-semibold text-base border-x-2 border-brand-hover">
              {isLoading ? "..." : quantityInCart}
            </span>
            <button
              className="flex-1 py-2 text-brand-hover font-bold text-xl hover:bg-brand-hover hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
