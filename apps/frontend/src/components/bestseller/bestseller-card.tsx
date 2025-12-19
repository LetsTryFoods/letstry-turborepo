import type { Product } from "@/types/product.types";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type BestsellerCardProps = {
  product: Product;
};

export const BestsellerCard = ({ product }: BestsellerCardProps) => {
  const hasDiscount = product.discountPercent > 0;

  return (
    <article className="relative flex flex-col rounded-xl bg-[#FCEFC0] p-6 min-w-[200px]">
      {hasDiscount && (
        <span className="absolute top-0 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-b-md">
          {product.discountPercent}%
          <br />
          OFF
        </span>
      )}
      <figure className="flex items-center justify-center h-48 mb-4">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={160}
          height={160}
          className="object-contain max-h-full"
        />
      </figure>
      <h3 className="text-lg font-bold text-center text-gray-900 line-clamp-2 min-h-[56px]">
        {product.name}
      </h3>
      <p className="text-sm text-center text-gray-600 mt-1">{product.unit}</p>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-lg font-bold text-gray-900">
          ₹{product.discountedPrice.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="text-sm text-gray-500 line-through">
            MRP ₹{product.price.toFixed(2)}
          </span>
        )}
      </div>
      <Button
        variant="outline"
        className="mt-4 w-full border-2 border-brand-hover bg-transparent text-brand-hover font-semibold py-2 rounded-lg hover:bg-brand-hover hover:text-white transition-colors"
      >
        Add to cart
      </Button>
    </article>
  );
};
