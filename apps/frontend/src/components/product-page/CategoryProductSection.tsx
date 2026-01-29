import Link from "next/link";
import Image from "next/image";
import { CategoryProductCard } from "./CategoryProductCard";

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

interface CategoryProductSectionProps {
  categoryName: string;
  categorySlug: string;
  products: Product[];
}

export const CategoryProductSection: React.FC<CategoryProductSectionProps> = ({
  categoryName,
  categorySlug,
  products,
}) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 sm:mt-10 md:mt-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          {categoryName}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="text-sm sm:text-base text-brand-hover font-medium flex items-center gap-1"
        >
          <span className="hover:underline">View All</span>{" "}
          <span className="flex justify-center items-center mb-2 font-extrabold">
            →
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {products.slice(0, 10).map((product) => (
          <CategoryProductCard key={product._id} product={product} categorySlug={categorySlug} />
        ))}
      </div>
    </section>
  );
};
