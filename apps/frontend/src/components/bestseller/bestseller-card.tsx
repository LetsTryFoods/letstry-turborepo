"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { CartService } from "@/lib/cart/cart-service";
import { useAnalytics } from "@/hooks/use-analytics";
import { useCart } from "@/lib/cart/use-cart";
import { useClickSpark } from "@/hooks/use-click-spark";
import { DiscountBadge } from "@/components/ui/discount-badge";
import { getCdnUrl } from "@/lib/image-utils";

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
  availabilityStatus?: string;
};

type BestsellerProduct = {
  _id: string;
  name: string;
  slug: string;
  defaultVariant: ProductVariant | null;
  categorySlug?: string;
};

type BestsellerCardProps = {
  product: BestsellerProduct;
  position?: number;
};

const BESTSELLER_LIST_NAME = "Homepage Bestsellers";

export const BestsellerCard = ({ product, position }: BestsellerCardProps) => {
  const variant = product.defaultVariant;
  if (!variant) return null;

  const isOutOfStock = variant.availabilityStatus !== "in_stock";
  const hasDiscount = variant.discountPercent > 0;
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { trackAddToCart, trackSelectItem, trackRemoveFromCart } =
    useAnalytics();

  const handleSelectItem = () => {
    trackSelectItem({
      id: product._id,
      name: product.name,
      price: variant.price,
      listName: BESTSELLER_LIST_NAME,
      position,
    });
  };
  const { data: cartData } = useCart();
  const triggerSpark = useClickSpark();

  const cart = cartData?.myCart;
  const cartItem = cart?.items?.find(
    (item: any) => item.variantId === variant._id,
  );
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (isLoading || isOutOfStock) return;

    setIsLoading(true);
    try {
      await CartService.addToCart(variant._id, 1);

      trackAddToCart({
        id: variant._id,
        name: product.name,
        price: variant.price,
        quantity: 1,
        variant: variant.packageSize,
      });

      queryClient.invalidateQueries({ queryKey: ["cart"] });
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
      await CartService.updateCartItem(variant._id, quantityInCart + 1);
      trackAddToCart({
        id: variant._id,
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
        await CartService.updateCartItem(variant._id, quantityInCart - 1);
      } else {
        await CartService.removeFromCart(variant._id);
      }
      trackRemoveFromCart({
        id: variant._id,
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
    <article
      className="bestseller-card-bg relative flex flex-col h-full text-center rounded-xl sm:rounded-2xl lg:rounded-3xl"
      style={{
        boxShadow: "10px 5px 10px 4px #00000040",
        transition: "box-shadow 0.3s",
      }}
    >
      {hasDiscount && (
        <DiscountBadge discountPercent={variant.discountPercent} />
      )}

      <Link href={`/product/${product.slug}`} onClick={handleSelectItem}>
        <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 mb-2 lg:mb-[10px]">
          <Image
            src={getCdnUrl(variant.thumbnailUrl)}
            alt={product.name}
            fill
            className="object-cover"
            loading="lazy"
            quality={75}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
        <h3 className="text-[13px] sm:text-sm md:text-base font-semibold text-gray-800 leading-snug min-h-[2.5rem] mb-1 lg:mb-[10px] px-1">
          {product.name}
        </h3>
      </Link>

      <div className="p-2 sm:p-4 md:p-5 lg:p-6 flex flex-col flex-grow">
        <div className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {variant.packageSize}
        </div>

        <div className="mb-2 lg:mb-[10px]">
          {hasDiscount ? (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-bold text-gray-900">
                ₹{variant.price.toFixed(2)}
              </span>
              <span className="text-[11px] sm:text-sm text-gray-500 line-through font-medium px-1">
                MRP ₹{variant.mrp.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-base sm:text-lg font-bold text-gray-900">
              ₹{variant.price.toFixed(2)}
            </span>
          )}
        </div>

        {isOutOfStock ? (
          <div className="flex justify-center mt-auto w-full">
            <button
              disabled
              className="w-full h-8 sm:h-10 border sm:border-2 border-[#0C5273] text-[#0C5273] text-[13px] sm:text-sm font-semibold rounded-md opacity-50 uppercase tracking-wide cursor-not-allowed"
            >
              Out of Stock
            </button>
          </div>
        ) : quantityInCart > 0 ? (
          <div className="mt-auto h-8 sm:h-10 w-full flex items-center justify-between border sm:border-2 border-[#0C5273] rounded-md overflow-hidden bg-[#D1E9F2]">
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
              onClick={(e) => {
                triggerSpark(e, "#ffffff");
                handleIncrement();
              }}
              disabled={isLoading}
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex justify-center mt-auto w-full">
            <button
              className="w-full h-8 sm:h-10 flex items-center justify-center text-[13px] sm:text-sm cursor-pointer border sm:border-2 border-[#0C5273] text-[#0C5273] font-semibold rounded-md transition-colors duration-200 uppercase tracking-wide hover:bg-[#0C5273] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                triggerSpark(e, "#ffffff");
                handleAddToCart();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        )}
      </div>

    </article>
  );
};
