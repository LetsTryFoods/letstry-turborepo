import { getBestsellerProducts } from "@/lib/product";
import { BestsellerCard } from "./bestseller-card";
import Link from "next/link";

export const BestsellerCombo = async () => {
  const products = await getBestsellerProducts("bestselling-combos", 20);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-6 sm:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-md sm:text-xl md:text-3xl font-bold text-gray-900">
            Bestselling Combos
          </h2>
          <Link
            href="/bestselling-combos"
            className="text-sm sm:text-xl text-[#0C5273] font-semibold"
          >
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-10 sm:grid-cols-4">
          {products.slice(0, 4).map((product: any) => (
            <BestsellerCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
