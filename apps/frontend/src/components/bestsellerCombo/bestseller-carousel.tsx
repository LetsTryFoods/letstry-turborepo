import { getBestsellerProducts } from "@/lib/product";
import { BestsellerCard } from "./bestseller-card";
import Link from "next/link";

export const BestsellerCombo = async () => {
  const products = await getBestsellerProducts("combo", 20);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Bestselling Combos
          </h2>
          <Link 
            href="/category/combo" 
            className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
          >
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product: any) => (
            <BestsellerCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
