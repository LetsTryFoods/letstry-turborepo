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
    <article className="relative flex flex-col h-full p-3 sm:p-4 md:p-5 lg:p-6 text-center rounded-xl sm:rounded-2xl lg:rounded-3xl transition-shadow duration-800"
      style={{
        backgroundColor: "#ffffff",
        boxShadow: "10px 5px 10px 4px #00000040",
      }}
    >

      {hasDiscount && <DiscountBadge discountPercent={variant.discountPercent} />}

      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full lg:h-40 md:h-[100px] h-[70px] lg:mb-[10px] md:mb-[10px] mb-[5px]">
          <Image
            src={variant.thumbnailUrl}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>
        <h3 className="lg:text-[22px] md:text-[14px] text-[12px] font-bold text-black leading-snug min-h-[35px] md:min-h-[40px] lg:min-h-[70px] lg:mb-[10px] md:mb-[10px] mb-[5px]">
          {product.name}
        </h3>
      </Link>
      <div className="lg:text-[15px] text-[12px] text-black lg:mb-[10px] md:mb-[10px] mb-[5px] font-bold">
        {variant.packageSize}
      </div>
      <div className="lg:mb-[10px] md:mb-[10px] mb-[5px]">
        {hasDiscount ? (
          <div className="text-black text-center">
            <span className="lg:text-[18px] md:text-[14px] text-[12px] font-semibold">
              ₹{variant.price.toFixed(2)}
            </span>
            <span className="line-through text-[#00000091] font-normal px-2 lg:text-[16px] md:text-[14px] text-[12px]">
              ₹{variant.mrp.toFixed(2)}
            </span>
          </div>
        ) : (
          <span className="text-[18px] font-bold text-black">
            ₹{variant.price.toFixed(2)}
          </span>
        )}
      </div>
      {quantityInCart > 0 ? (
        <div className="flex justify-center">
          <button
            className="cursor-pointer w-[30px] lg:w-[40px] h-[30px] pl-1 lg:pl-2 lg:h-[44px] text-[12px] lg:text-[18px] md:text-[16px] border-[#0C5273] text-white bg-[#0C5273] font-semibold rounded-l lg:hover:bg-[#003349] transition"
            onClick={handleDecrement}
            disabled={isLoading}
          >
            −
          </button>
          <input
            type="text"
            readOnly
            value={isLoading ? '...' : quantityInCart}
            className="w-[40px] md:w-[60px] lg:w-[80px] h-[30px] lg:h-[44px] text-[14px] lg:text-[18px] md:text-[16px] text-center border-y-2 border-[#0C5273] text-white bg-[#0C5273] rounded-none"
          />
          <button
            className=" cursor-pointer w-[30px] lg:w-[40px] pl-1 lg:pl-2 h-[30px] lg:h-[44px] text-[12px] lg:text-[18px] md:text-[16px] border-2 border-[#0C5273] text-white bg-[#0C5273] font-semibold rounded-r lg:hover:bg-[#003349] transition"
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
        <div className="flex justify-center">
          <button
            className="cursor-pointer w-[120px] lg:w-[200px] md:w-[140px] h-[30px] lg:h-[44px] bg-[#0C5273] text-white font-semibold text-[12px] lg:text-[16px] rounded-l rounded-r lg:hover:bg-[#003349] transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              triggerSpark(e, "#ffffff");
              handleAddToCart();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      )}
    </article>
  );
};
