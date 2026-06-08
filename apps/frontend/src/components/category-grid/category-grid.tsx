import { getHomeCategories } from "@/lib/home";
import { CategoryCard } from "./category-card";
import type { Category } from "@/types/category.types";

export const CategoryGrid = async () => {
  const data = await getHomeCategories(100);

  const mappedCategories: Category[] = data.items
    .filter((c) => c.favourite === true)
    .map((c) => ({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl || "/placeholder-image.svg",
      href: `/${c.slug}`,
    }));

  return (
    <section className="container py-4 mx-auto px-4 sm:px-6 space-y-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-left">
        Find your favourite
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-x-6 gap-y-2 sm:gap-x-8 sm:gap-y-8 md:gap-x-12 md:gap-y-10">
        {mappedCategories.map((c, index) => (
          <CategoryCard key={c.id} category={c} priority={index < 4} />
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
