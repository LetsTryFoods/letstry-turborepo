"use client";
import { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Image from "next/image";
import Link from "next/link";
import { CartService } from '@/lib/cart/cart-service';
import { useAnalytics } from '@/hooks/use-analytics';
import { useCart } from '@/lib/cart/use-cart';
import { useClickSpark } from '@/hooks/use-click-spark';
import { DiscountBadge } from '@/components/ui/discount-badge';
import { getCdnUrl } from '@/lib/image-utils';

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
  categorySlug?: string;
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
  const triggerSpark = useClickSpark();

  const cart = cartData?.myCart;
  const cartItem = cart?.items?.find((item: any) => item.variantId === variant._id);
  const quantityInCart = cartItem?.quantity || 0;


  const handleAddToCart = async () => {
    if (isLoading) return;

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
      await CartService.updateCartItem(variant._id, quantityInCart + 1);
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
        await CartService.updateCartItem(variant._id, quantityInCart - 1);
      } else {
        await CartService.removeFromCart(variant._id);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="bestseller-card-bg relative flex flex-col h-full p-2 sm:p-4 md:p-5 lg:p-6 text-center rounded-xl sm:rounded-2xl lg:rounded-3xl"
      style={{
        boxShadow: "10px 5px 10px 4px #00000040",
        transition: "box-shadow 0.3s",
      }}
    >
      {hasDiscount && <DiscountBadge discountPercent={variant.discountPercent} />}

      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full h-[90px] sm:h-[110px] md:h-[100px] lg:h-40 mb-2 lg:mb-[10px]">
          <Image
            src={getCdnUrl(variant.thumbnailUrl)}
            alt={product.name}
            fill
            className="object-contain"
            loading="lazy"
            quality={75}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
        <h3 className="text-[11px] sm:text-[13px] md:text-[14px] lg:text-[22px] font-bold text-black leading-snug min-h-[28px] sm:min-h-[36px] md:min-h-[40px] lg:min-h-[70px] mb-1 lg:mb-[10px]">
          {product.name}
        </h3>
      </Link>

      <div className="text-[11px] sm:text-[12px] lg:text-[15px] text-black mb-1 lg:mb-[10px] font-bold">
        {variant.packageSize}
      </div>

      <div className="mb-2 lg:mb-[10px]">
        {hasDiscount ? (
          <div className="text-black text-center">
            <span className="text-[11px] sm:text-[13px] md:text-[14px] lg:text-[18px] font-semibold">
              ₹{variant.price.toFixed(2)}
            </span>
            <span className="line-through text-[#00000091] font-normal px-1 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px]">
              MRP ₹{variant.mrp.toFixed(2)}
            </span>
          </div>
        ) : (
          <span className="text-[12px] sm:text-[14px] lg:text-[18px] font-bold text-black">
            ₹{variant.price.toFixed(2)}
          </span>
        )}
      </div>

      {quantityInCart > 0 ? (
        <div className="flex justify-center mt-auto">
          <button
            className="cursor-pointer w-[26px] sm:w-[34px] lg:w-[40px] h-[28px] sm:h-[34px] lg:h-[44px] text-[12px] lg:text-[18px] bg-[#0C5273] text-white font-semibold rounded-l hover:bg-[#003349] transition"
            onClick={handleDecrement}
            disabled={isLoading}
          >
            −
          </button>
          <input
            type="text"
            readOnly
            value={isLoading ? '...' : quantityInCart}
            className="w-[36px] sm:w-[50px] lg:w-[80px] h-[28px] sm:h-[34px] lg:h-[44px] text-[12px] lg:text-[18px] text-center border-y-2 border-[#0C5273] text-white bg-[#0C5273] rounded-none"
          />
          <button
            className="cursor-pointer w-[26px] sm:w-[34px] lg:w-[40px] h-[28px] sm:h-[34px] lg:h-[44px] text-[12px] lg:text-[18px] border-2 border-[#0C5273] text-white bg-[#0C5273] font-semibold rounded-r hover:bg-[#003349] transition"
            onClick={(e) => { triggerSpark(e, "#ffffff"); handleIncrement(); }}
            disabled={isLoading}
          >
            +
          </button>
        </div>
      ) : (
        <div className="flex justify-center mt-auto">
          <button
            className="cursor-pointer w-full h-[28px] sm:h-[34px] lg:h-[44px] bg-[#0C5273] text-white font-semibold text-[10px] sm:text-[12px] lg:text-[16px] rounded-lg hover:bg-[#003349] transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => { triggerSpark(e, "#ffffff"); handleAddToCart(); }}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      )}
    </article>
  );
};
